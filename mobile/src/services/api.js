// src/services/api.js - الإصدار النهائي للـ API الحقيقي
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// عنوان API الحقيقي - تأكد من أنه مطابق للخادم
const API_URL = "http://localhost:5000/api";

// إنشاء مثيل axios
const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔥 **مهم: إضافة التوكن تلقائياً إلى الطلبات**
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(
                `📤 إضافة التوكن إلى الطلب: ${token.substring(0, 20)}...`,
            );
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// 🔥 **معالج الاستجابة للتصحيح**
api.interceptors.response.use(
    (response) => {
        console.log(
            `✅ ${response.config.method?.toUpperCase()} ${response.config.url}: ${response.status}`,
        );
        return response;
    },
    (error) => {
        console.error(`❌ خطأ في API: ${error.config?.url}`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        });

        if (error.response?.status === 401) {
            console.log("🔒 تم رفض الطلب (401)، مسح التوكن");
            AsyncStorage.removeItem("authToken");
        }

        return Promise.reject(error);
    },
);

// 🔥 **دوال المصادقة - بناءً على بنية API الخاصة بك**
export const authAPI = {
    login: async (credentials) => {
        try {
            console.log("📤 جاري تسجيل الدخول...");
            const response = await api.post("/auth/login", credentials);

            // 🔍 **تحليل بنية الاستجابة**
            console.log(
                "📊 بنية استجابة API:",
                JSON.stringify(response.data, null, 2),
            );

            let token = null;
            let userData = {};

            // 🔧 **الحالات المختلفة لبنية الاستجابة**
            // الحالة 1: { success: true, data: { token, user } }
            if (response.data.success && response.data.data) {
                token = response.data.data.token;
                userData = response.data.data.user || {};
            }
            // الحالة 2: { token, user }
            else if (response.data.token) {
                token = response.data.token;
                userData = response.data.user || {};
            }
            // الحالة 3: { access_token, user }
            else if (response.data.access_token) {
                token = response.data.access_token;
                userData = response.data.user || {};
            }
            // الحالة 4: { data: { token, user } }
            else if (response.data.data?.token) {
                token = response.data.data.token;
                userData = response.data.data.user || {};
            }

            if (token) {
                await AsyncStorage.setItem("authToken", token);
                await AsyncStorage.setItem("user", JSON.stringify(userData));
                console.log("✅ تم حفظ التوكن والمستخدم");
            } else {
                console.error("❌ لا يوجد توكن في الاستجابة");
            }

            return response;
        } catch (error) {
            console.error(
                "❌ خطأ في تسجيل الدخول:",
                error.response?.data || error.message,
            );
            throw error;
        }
    },

    logout: async () => {
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("user");
    },
};

// 🔥 **دوال المشاريع - تستخدم API الحقيقي**
export const projectsAPI = {
    // جلب جميع المشاريع
    getAll: async () => {
        try {
            console.log("📡 جاري جلب المشاريع من API...");
            const response = await api.get("/projects");

            // 🔍 **تحليل بنية الاستجابة**
            console.log("📊 بنية مشاريع API:", {
                keys: Object.keys(response.data),
                hasSuccess: "success" in response.data,
                hasData: "data" in response.data,
                isArray: Array.isArray(response.data),
                isArrayData: Array.isArray(response.data?.data),
            });

            // 🔧 **معالجة أشكال الاستجابة المختلفة**
            let projects = [];

            // النمط 1: { success: true, data: [] }
            if (response.data.success && Array.isArray(response.data.data)) {
                projects = response.data.data;
            }
            // النمط 2: { data: [] }
            else if (Array.isArray(response.data.data)) {
                projects = response.data.data;
            }
            // النمط 3: { projects: [] }
            else if (Array.isArray(response.data.projects)) {
                projects = response.data.projects;
            }
            // النمط 4: مصفوفة مباشرة
            else if (Array.isArray(response.data)) {
                projects = response.data;
            }
            // النمط 5: { results: [] }
            else if (Array.isArray(response.data.results)) {
                projects = response.data.results;
            }
            // النمط 6: { items: [] }
            else if (Array.isArray(response.data.items)) {
                projects = response.data.items;
            }

            console.log(`✅ تم جلب ${projects.length} مشروع من API`);
            return {
                success: true,
                data: projects,
                total: projects.length,
            };
        } catch (error) {
            console.error("❌ خطأ في جلب المشاريع:", error);
            throw error;
        }
    },

    // جلب مشاريع المستخدم
    getMyProjects: async () => {
        try {
            console.log("📡 جاري جلب مشاريعي من API...");
            const response = await api.get("/projects");

            // نفس معالجة getAll
            let projects = [];

            if (response.data.success && Array.isArray(response.data.data)) {
                projects = response.data.data;
            } else if (Array.isArray(response.data.data)) {
                projects = response.data.data;
            } else if (Array.isArray(response.data)) {
                projects = response.data;
            }

            console.log(`✅ تم جلب ${projects.length} مشروع شخصي`);
            return {
                success: true,
                data: projects,
            };
        } catch (error) {
            console.error("❌ خطأ في جلب مشاريعي:", error);
            throw error;
        }
    },

    // جلب مشروع محدد
    getById: async (id) => {
        try {
            console.log(`📡 جاري جلب المشروع ${id}...`);
            const response = await api.get(`/projects/${id}`);

            // معالجة الاستجابة
            let project = null;

            if (response.data.success && response.data.data) {
                project = response.data.data;
            } else if (response.data.data) {
                project = response.data.data;
            } else {
                project = response.data;
            }

            console.log("✅ تم جلب المشروع:", project?.title);
            return {
                success: true,
                data: project,
            };
        } catch (error) {
            console.error(`❌ خطأ في جلب المشروع ${id}:`, error);
            throw error;
        }
    },

    // إنشاء مشروع جديد
    create: async (projectData) => {
        try {
            console.log("📤 جاري إرسال مشروع جديد إلى API:", projectData);
            const response = await api.post("/projects", projectData);

            console.log("✅ استجابة إنشاء المشروع:", response.data);
            return {
                success: true,
                data: response.data.data || response.data,
                message: "تم إنشاء المشروع بنجاح",
            };
        } catch (error) {
            console.error(
                "❌ خطأ في إنشاء المشروع:",
                error.response?.data || error.message,
            );
            throw error;
        }
    },

    // تحديث مشروع
    update: async (id, projectData) => {
        try {
            const response = await api.put(`/projects/${id}`, projectData);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error(`❌ خطأ في تحديث المشروع ${id}:`, error);
            throw error;
        }
    },

    // حذف مشروع
    delete: async (id) => {
        try {
            const response = await api.delete(`/projects/${id}`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error(`❌ خطأ في حذف المشروع ${id}:`, error);
            throw error;
        }
    },
};

// 🔥 **دالة للتحقق من صحة التوكن**
export const verifyToken = async () => {
    try {
        const token = await AsyncStorage.getItem("authToken");

        if (!token) {
            return { isValid: false, message: "لا يوجد توكن" };
        }

        // يمكنك إضافة نقطة API للتحقق من التوكن إذا كانت موجودة
        // const response = await api.get("/auth/verify");
        // return response.data;

        return { isValid: true, token };
    } catch (error) {
        console.error("❌ خطأ في التحقق من التوكن:", error);
        return { isValid: false, message: error.message };
    }
};

// 🔥 **اختبار اتصال API**
export const testAPIConnection = async () => {
    try {
        console.log("🔍 اختبار اتصال API...");
        const response = await axios.get(API_URL, { timeout: 5000 });
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

export default api;
