// src/services/api.js - النسخة المعدلة بالكامل
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ للمتصفح (Web) فقط - استخدم localhost مباشرة
const API_URL = "http://localhost:5000/api";

console.log("🌐 البيئة: ويب (متصفح)");
console.log("📡 عنوان API:", API_URL);

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Helper to safely access localStorage (only when running in web)
const safeLocal = {
    getItem: (k) => {
        try {
            if (typeof window !== "undefined" && window.localStorage) {
                return localStorage.getItem(k);
            }
        } catch (e) {
            return null;
        }
        return null;
    },
    setItem: (k, v) => {
        try {
            if (typeof window !== "undefined" && window.localStorage) {
                localStorage.setItem(k, v);
            }
        } catch (e) {}
    },
    removeItem: (k) => {
        try {
            if (typeof window !== "undefined" && window.localStorage) {
                localStorage.removeItem(k);
            }
        } catch (e) {}
    },
    clear: () => {
        try {
            if (typeof window !== "undefined" && window.localStorage) {
                localStorage.clear();
            }
        } catch (e) {}
    },
};

// إضافة التوكن تلقائياً للطلبات
api.interceptors.request.use(
    async (config) => {
        // ⚠️ للمتصفح، تأكد من استخدام AsyncStorage المناسب
        let token;

        // محاولة جلب التوكن من AsyncStorage
        try {
            token = await AsyncStorage.getItem("authToken");
            if (!token) token = safeLocal.getItem("authToken");
        } catch (error) {
            console.log(
                "⚠️ AsyncStorage read failed, falling back to localStorage",
            );
            token = safeLocal.getItem("authToken");
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`📤 إضافة التوكن للطلب: ${config.url}`);
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// معالجة الأخطاء العامة
api.interceptors.response.use(
    (response) => {
        console.log(
            `✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`,
            response.status,
        );
        return response;
    },
    (error) => {
        console.error("❌ خطأ في الطلب:", {
            url: error.config?.url,
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
        });

        if (error.response?.status === 401) {
            // مسح التخزين عند انتهاء الجلسة
            AsyncStorage.removeItem("authToken");
            AsyncStorage.removeItem("user");
            safeLocal.removeItem("authToken");
            safeLocal.removeItem("user");
        }
        return Promise.reject(error);
    },
);

// 🔥 دوال المصادقة
export const authAPI = {
    login: async (credentials) => {
        try {
            console.log("📤 جاري تسجيل الدخول...");
            const response = await api.post("/auth/login", credentials);

            console.log("📊 بنية الاستجابة:", response.data);

            // هيكل الاستجابة: { success, data: { token, user } }
            if (response.data.success && response.data.data) {
                const { token, ...userData } = response.data.data;

                if (!token) {
                    throw new Error("التوكن غير موجود في استجابة الخادم");
                }

                // حفظ في التخزين
                await AsyncStorage.setItem("authToken", token);
                await AsyncStorage.setItem("user", JSON.stringify(userData));

                // أيضًا لحفظ في localStorage للمتصفح
                safeLocal.setItem("authToken", token);
                safeLocal.setItem("user", JSON.stringify(userData));

                console.log("✅ تم تسجيل الدخول بنجاح");
                console.log("👤 المستخدم:", userData);

                return {
                    success: true,
                    token,
                    data: userData,
                };
            } else {
                throw new Error("هيكل الاستجابة غير صحيح من الخادم");
            }
        } catch (error) {
            console.error("❌ خطأ في تسجيل الدخول:", error);
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await api.post("/users/register", userData);

            if (response.data.success && response.data.data) {
                const { token, ...user } = response.data.data;

                await AsyncStorage.setItem("authToken", token);
                await AsyncStorage.setItem("user", JSON.stringify(user));
                safeLocal.setItem("authToken", token);
                safeLocal.setItem("user", JSON.stringify(user));

                return response.data;
            }
            throw new Error("هيكل الاستجابة غير صحيح");
        } catch (error) {
            console.error("❌ خطأ في التسجيل:", error);
            throw error;
        }
    },

    logout: async () => {
        try {
            // Remove only auth-related keys to avoid clearing unrelated data
            await AsyncStorage.removeItem("authToken");
            await AsyncStorage.removeItem("user");
            console.log("authAPI.logout: cleared AsyncStorage auth keys");
        } catch (e) {
            console.warn("authAPI.logout AsyncStorage remove failed:", e);
        }
        try {
            safeLocal.removeItem("authToken");
            safeLocal.removeItem("user");
            console.log("authAPI.logout: cleared safeLocal auth keys");
        } catch (e) {
            console.warn("authAPI.logout safeLocal clear failed:", e);
        }
        return { success: true };
    },

    changePassword: async ({ currentPassword, newPassword }) => {
        try {
            const response = await api.post("/auth/change-password", {
                currentPassword,
                newPassword,
            });
            return response.data;
        } catch (error) {
            console.error(
                "❌ خطأ في تغيير كلمة المرور:",
                error.response?.data || error.message,
            );
            throw error;
        }
    },

    // دالة للتحقق من حالة التوكن
    checkAuth: async () => {
        const token =
            (await AsyncStorage.getItem("authToken")) ||
            safeLocal.getItem("authToken");
        const userString =
            (await AsyncStorage.getItem("user")) || safeLocal.getItem("user");

        if (token && userString) {
            return {
                isAuthenticated: true,
                token,
                user: JSON.parse(userString),
            };
        }
        return { isAuthenticated: false };
    },
};

// 🔥 دوال المشاريع - معدلة لجلب البيانات الحقيقية
export const projectsAPI = {
    getAll: async () => {
        try {
            console.log("📡 جاري جلب المشاريع من السيرفر...");

            // ✅ استخدم axios مباشرة مع التوكن
            const token =
                (await AsyncStorage.getItem("authToken")) ||
                safeLocal.getItem("authToken");

            if (!token) {
                throw new Error("غير مصرح بالوصول. يرجى تسجيل الدخول");
            }

            const response = await axios.get(`${API_URL}/projects`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                timeout: 10000,
            });

            console.log("📊 استجابة المشاريع من السيرفر:", {
                status: response.status,
                dataKeys: Object.keys(response.data),
                hasData: !!response.data.data,
                dataLength: response.data.data?.length || 0,
            });

            // معالجة جميع الأشكال الممكنة للاستجابة
            let projects = [];

            // الشكل 1: { success: true, data: [] }
            if (response.data.success && Array.isArray(response.data.data)) {
                projects = response.data.data;
            }
            // الشكل 2: { data: [] }
            else if (Array.isArray(response.data.data)) {
                projects = response.data.data;
            }
            // الشكل 3: { projects: [] }
            else if (Array.isArray(response.data.projects)) {
                projects = response.data.projects;
            }
            // الشكل 4: مصفوفة مباشرة
            else if (Array.isArray(response.data)) {
                projects = response.data;
            }
            // الشكل 5: { results: [] }
            else if (Array.isArray(response.data.results)) {
                projects = response.data.results;
            }

            console.log(`✅ تم جلب ${projects.length} مشروع من السيرفر`);

            return {
                success: true,
                data: projects,
                total: projects.length,
            };
        } catch (error) {
            console.error("❌ خطأ في جلب المشاريع:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });

            // إعادة الخطأ للتعامل معه في الواجهة
            throw error;
        }
    },

    // جلب مشاريع المستخدم الحالي (مشاريعي)
    getMyProjects: async () => {
        try {
            console.log("📡 جاري جلب مشاريعي من السيرفر...");

            const token =
                (await AsyncStorage.getItem("authToken")) ||
                safeLocal.getItem("authToken");

            const userString =
                (await AsyncStorage.getItem("user")) ||
                safeLocal.getItem("user");

            if (!token || !userString) {
                throw new Error("غير مصرح بالوصول. يرجى تسجيل الدخول");
            }

            let userId;
            try {
                userId = JSON.parse(userString)._id;
            } catch (e) {
                throw new Error("بيانات المستخدم غير صالحة");
            }

            const response = await axios.get(
                `${API_URL}/projects?userId=${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 10000,
                },
            );

            // Normalize response like getAll
            let projects = [];
            if (response.data.success && Array.isArray(response.data.data)) {
                projects = response.data.data;
            } else if (Array.isArray(response.data.data)) {
                projects = response.data.data;
            } else if (Array.isArray(response.data.projects)) {
                projects = response.data.projects;
            } else if (Array.isArray(response.data)) {
                projects = response.data;
            }

            console.log(`✅ تم جلب ${projects.length} مشروع شخصي`);

            return { success: true, data: projects, total: projects.length };
        } catch (error) {
            console.error("❌ خطأ في جلب مشاريعي:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            throw error;
        }
    },

    create: async (projectData, images = []) => {
        try {
            // Use the configured axios instance so interceptors and baseURL apply
            // If images are provided, send multipart/form-data, otherwise JSON
            if (images && images.length > 0) {
                const form = new FormData();
                // append JSON fields
                Object.keys(projectData || {}).forEach((k) => {
                    if (
                        projectData[k] !== undefined &&
                        projectData[k] !== null
                    ) {
                        form.append(k, projectData[k]);
                    }
                });

                // append images (expects File/Blob objects or objects with uri/name/type for RN web)
                images.forEach((file, idx) => {
                    // in React Native / Expo web, file may be { uri, name, type }
                    form.append("images", file);
                });

                const response = await api.post("/projects", form, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                return response.data;
            }

            // No images: send JSON using api instance (adds Authorization via interceptor)
            const response = await api.post("/projects", projectData);
            return response.data;
        } catch (error) {
            console.error("❌ خطأ في إنشاء المشروع:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const token =
                (await AsyncStorage.getItem("authToken")) ||
                safeLocal.getItem("authToken");

            const response = await axios.get(`${API_URL}/projects/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            console.error("❌ خطأ في جلب المشروع:", error);
            throw error;
        }
    },

    update: async (id, projectData) => {
        try {
            const token =
                (await AsyncStorage.getItem("authToken")) ||
                safeLocal.getItem("authToken");

            const response = await axios.put(
                `${API_URL}/projects/${id}`,
                projectData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            return response.data;
        } catch (error) {
            console.error("❌ خطأ في تحديث المشروع:", error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const token =
                (await AsyncStorage.getItem("authToken")) ||
                safeLocal.getItem("authToken");

            const response = await axios.delete(`${API_URL}/projects/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            console.error("❌ خطأ في حذف المشروع:", error);
            throw error;
        }
    },
};

// في قسم commentAPI في api.js - استبدل بالكامل:

export const commentAPI = {
    // جلب تعليقات مشروع محدد
    getComments: async (projectId) => {
        try {
            console.log(`📡 جلب تعليقات المشروع: ${projectId}`);
            // المسار: /api/comments/project/:projectId
            const response = await api.get(`/comments/project/${projectId}`);
            console.log("📊 استجابة التعليقات:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ خطأ في جلب التعليقات:", error);
            if (error.response?.status === 404) {
                return { comments: [] };
            }
            throw error;
        }
    },

    // إضافة تعليق جديد - ✅ الهيكل الصحيح بناءً على Comment.js
    addComment: async (projectId, content) => {
        try {
            console.log(`📤 إضافة تعليق للمشروع: ${projectId}`);

            // ✅ الهيكل الصحيح المطلوب بناءً على Comment.js:
            const commentData = {
                projectId: projectId, // ⬅️ الاسم الصحيح: projectId (ليس project)
                content: content, // ⬅️ الاسم الصحيح: content (ليس text)
                // userId سيتم إضافته تلقائياً في السيرفر من التوكن
            };

            console.log(
                "📤 إرسال بيانات التعليق (الهيكل الصحيح):",
                commentData,
            );
            const response = await api.post(`/comments`, commentData);
            console.log("📊 استجابة إضافة التعليق:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ خطأ في إضافة التعليق:", error);

            // تسجيل تفاصيل الخطأ للمساعدة في التصحيح
            if (error.response) {
                console.error("🔴 تفاصيل الخطأ من السيرفر:", {
                    status: error.response.status,
                    data: error.response.data,
                });
            }

            throw error;
        }
    },

    // حذف تعليق
    deleteComment: async (projectId, commentId) => {
        try {
            console.log(`🗑️ حذف تعليق: ${commentId}`);
            // المسار: /api/comments/:commentId
            const response = await api.delete(`/comments/${commentId}`);
            console.log("📊 استجابة حذف التعليق:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ خطأ في حذف التعليق:", error);
            throw error;
        }
    },
};

// 🔥 دوال الإعجابات - المسارات الصحيحة بناءً على server.js
// في ملف api.js - استبدل قسم likeAPI بالكامل بهذا:

export const likeAPI = {
    // الإعجاب بمشروع
    likeProject: async (projectId) => {
        try {
            console.log(`❤️ الإعجاب بالمشروع: ${projectId}`);
            // المسار الصحيح: /api/projects/:projectId/like
            const response = await api.post(`/projects/${projectId}/like`);
            console.log("📊 استجابة الإعجاب:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ خطأ في الإعجاب بالمشروع:", error);
            throw error;
        }
    },

    // إلغاء الإعجاب بمشروع
    unlikeProject: async (projectId) => {
        try {
            console.log(`💔 إلغاء الإعجاب بالمشروع: ${projectId}`);
            // المسار الصحيح: /api/projects/:projectId/like
            const response = await api.delete(`/projects/${projectId}/like`);
            console.log("📊 استجابة إلغاء الإعجاب:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ خطأ في إلغاء الإعجاب بالمشروع:", error);
            throw error;
        }
    },

    // التحقق من حالة الإعجاب - إصدار معدل لا يرمي خطأ 404
    checkLikeStatus: async (projectId) => {
        try {
            console.log(`🔍 التحقق من حالة الإعجاب للمشروع: ${projectId}`);
            // جرب المسار إذا كان موجودًا
            const response = await api.get(
                `/projects/${projectId}/like/status`,
            );
            console.log("📊 حالة الإعجاب من API:", response.data);
            return response.data;
        } catch (error) {
            // إذا كان الخطأ 404، فالمسار غير موجود، نعيد حالة افتراضية
            if (error.response?.status === 404) {
                console.log(
                    "⚠️ مسار التحقق من حالة الإعجاب غير متوفر، نستخدم الافتراضي",
                );
                return { isLiked: false, likesCount: 0 };
            }
            console.error("❌ خطأ في التحقق من حالة الإعجاب:", error);
            throw error;
        }
    },
};

// 🔥 دوال المتابعة
export const followAPI = {
    followUser: async (userId) => {
        try {
            const response = await api.post(`/follow/${userId}`);
            return response.data;
        } catch (error) {
            console.error("❌ خطأ في متابعة المستخدم:", error);
            throw error;
        }
    },

    unfollowUser: async (userId) => {
        try {
            const response = await api.delete(`/follow/${userId}`);
            return response.data;
        } catch (error) {
            console.error("❌ خطأ في إلغاء متابعة المستخدم:", error);
            throw error;
        }
    },

    checkFollowStatus: async (userId) => {
        try {
            const response = await api.get(`/follow/status/${userId}`);
            return response.data;
        } catch (error) {
            console.error("❌ خطأ في التحقق من حالة المتابعة:", error);
            throw error;
        }
    },

    getFollowers: async (userId) => {
        try {
            const response = await api.get(`/follow/followers/${userId}`);
            return response.data;
        } catch (error) {
            console.error("❌ خطأ في جلب المتابعين:", error);
            throw error;
        }
    },

    getFollowing: async (userId) => {
        try {
            const response = await api.get(`/follow/following/${userId}`);
            return response.data;
        } catch (error) {
            console.error("❌ خطأ في جلب المتابَعين:", error);
            throw error;
        }
    },
    // جلب إحصائيات المستخدم (تجميعي)
    getUserStats: async (userId) => {
        try {
            // طلب المتابعين والمتابَعين والمشاريع الخاصة بالمستخدم
            const [followersRes, followingRes, projectsRes] = await Promise.all(
                [
                    api.get(`/follow/followers/${userId}`),
                    api.get(`/follow/following/${userId}`),
                    api.get(`/projects?userId=${userId}`),
                ],
            );

            const followersCount =
                followersRes.data?.pagination?.total ||
                (Array.isArray(followersRes.data?.data)
                    ? followersRes.data.data.length
                    : 0);

            const followingCount =
                followingRes.data?.pagination?.total ||
                (Array.isArray(followingRes.data?.data)
                    ? followingRes.data.data.length
                    : 0);

            // projectsRes may return an array or wrapped object
            let projects = [];
            if (Array.isArray(projectsRes.data)) projects = projectsRes.data;
            else if (Array.isArray(projectsRes.data?.data))
                projects = projectsRes.data.data;
            else if (Array.isArray(projectsRes.data?.projects))
                projects = projectsRes.data.projects;

            const projectsCount = projects.length;
            const likesCount = projects.reduce(
                (acc, p) => acc + (p.likesCount || 0),
                0,
            );

            return {
                data: {
                    followersCount,
                    followingCount,
                    projectsCount,
                    likesCount,
                },
            };
        } catch (error) {
            console.error("❌ خطأ في جلب إحصائيات المستخدم:", error);
            throw error;
        }
    },
};

// 🔥 دوال المستخدمين
export const usersAPI = {
    getProfile: async () => {
        try {
            // auth endpoint returns { success: true, data: user }
            const response = await api.get("/auth/me");
            return response.data;
        } catch (error) {
            console.error("❌ خطأ في جلب الملف الشخصي:", error);
            throw error;
        }
    },

    // جلب ملف مستخدم عام بحسب المعرف
    getUserProfile: async (userId) => {
        try {
            const response = await api.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error("❌ خطأ في جلب ملف المستخدم بحسب المعرف:", error);
            throw error;
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await api.put("/users/profile", profileData);
            return response.data;
        } catch (error) {
            console.error("❌ خطأ في تحديث الملف الشخصي:", error);
            throw error;
        }
    },
};

// 🔥 اختبار الاتصال
export const testAPIConnection = async () => {
    try {
        console.log("🔍 اختبار اتصال API...");
        const response = await axios.get("http://localhost:5000/api/test", {
            timeout: 5000,
        });

        console.log("✅ اتصال API ناجح:", response.data);
        return {
            connected: true,
            status: response.status,
            data: response.data,
        };
    } catch (error) {
        console.error("❌ فشل اتصال API:", error.message);
        return {
            connected: false,
            error: error.message,
        };
    }
};

// 🔥 اختبار جلب المشاريع مباشرة (للتجربة)
export const testProjectsConnection = async () => {
    try {
        const token =
            (await AsyncStorage.getItem("authToken")) ||
            localStorage.getItem("authToken");

        if (!token) {
            return { success: false, message: "غير مصرح" };
        }

        const response = await axios.get("http://localhost:5000/api/projects", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 8000,
        });

        return {
            success: true,
            data: response.data,
            count: response.data.data?.length || response.data.length || 0,
        };
    } catch (error) {
        console.error("❌ اختبار المشاريع فشل:", error.message);
        return {
            success: false,
            error: error.message,
            status: error.response?.status,
        };
    }
};

// 🔥 اختبار التعليقات
export const testCommentsAPI = async (projectId) => {
    try {
        console.log("🔍 اختبار واجهة التعليقات...");

        if (!projectId) {
            return { success: false, message: "معرف المشروع مطلوب" };
        }

        // 1. اختبار جلب التعليقات
        console.log(`📡 اختبار GET /api/comments/project/${projectId}`);
        try {
            const commentsRes = await api.get(`/comments/project/${projectId}`);
            const commentsData =
                commentsRes.data?.data ||
                commentsRes.data?.comments ||
                commentsRes.data ||
                [];

            console.log("✅ GET /api/comments/project/:projectId - النجاح");
            console.log("   عدد التعليقات:", commentsData.length || 0);

            // 2. اختبار إضافة تعليق
            console.log(`\n📤 اختبار POST /api/comments`);
            const addRes = await api.post("/comments", {
                projectId: projectId,
                content:
                    "هذا تعليق اختباري من تطبيق React Native - " +
                    new Date().toLocaleTimeString(),
            });

            const addedComment = addRes.data?.data || addRes.data || null;

            console.log("✅ POST /api/comments - النجاح");
            console.log("   التعليق المضاف:", addedComment);

            return {
                success: true,
                comments: commentsData,
                addedComment,
            };
        } catch (error) {
            console.error(
                "❌ فشل في اختبار التعليقات:",
                error.response?.status,
                error.message,
            );
            return {
                success: false,
                error: error.message,
                status: error.response?.status,
            };
        }
    } catch (error) {
        console.error("❌ خطأ في اختبار التعليقات:", error);
        return {
            success: false,
            error: error.message,
        };
    }
};

// 🔥 اختبار الإعجابات
export const testLikesAPI = async (projectId) => {
    try {
        console.log("🔍 اختبار واجهة الإعجابات...");

        if (!projectId) {
            return { success: false, message: "معرف المشروع مطلوب" };
        }

        // 1. اختبار التحقق من حالة الإعجاب
        console.log(`📡 اختبار GET /api/projects/${projectId}/like/status`);
        try {
            const statusRes = await api.get(
                `/projects/${projectId}/like/status`,
            );
            console.log("✅ GET /api/projects/:id/like/status - النجاح");
            console.log("   حالة الإعجاب:", statusRes.data);

            // 2. اختبار الإعجاب
            console.log(`\n❤️ اختبار POST /api/projects/${projectId}/like`);
            const likeRes = await api.post(`/projects/${projectId}/like`);
            console.log("✅ POST /api/projects/:id/like - النجاح");
            console.log("   استجابة الإعجاب:", likeRes.data);

            return {
                success: true,
                initialStatus: statusRes.data,
                likeResult: likeRes.data,
            };
        } catch (error) {
            console.error(
                "❌ فشل في اختبار الإعجابات:",
                error.response?.status,
                error.message,
            );
            return {
                success: false,
                error: error.message,
                status: error.response?.status,
            };
        }
    } catch (error) {
        console.error("❌ خطأ في اختبار الإعجابات:", error);
        return {
            success: false,
            error: error.message,
        };
    }
};

export default api;
