// mobile/src/services/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:5000/api";
console.log("📡 عنوان API:", API_URL);

// متغير عام مؤقت (cache) للتوكن
let cachedToken = null;

export const setAuthToken = async (token) => {
    console.log(
        "🔧 setAuthToken called with token:",
        token ? token.substring(0, 10) + "..." : "null",
    );
    cachedToken = token;
    console.log(
        "🔧 setAuthToken: cachedToken now:",
        cachedToken ? "set" : "null",
    );
    if (token) {
        await AsyncStorage.setItem("authToken", token);
        console.log("✅ setAuthToken: تم حفظ التوكن في AsyncStorage والكاش");
    } else {
        await AsyncStorage.removeItem("authToken");
        console.log("✅ setAuthToken: تم إزالة التوكن");
    }
};

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
});

// Interceptor لإضافة التوكن إلى كل طلب
api.interceptors.request.use(
    async (config) => {
        try {
            // أولاً: استخدام التوكن من الكاش
            let token = cachedToken;
            if (!token) {
                // إذا لم يكن في الكاش، نقرأ من AsyncStorage
                token = await AsyncStorage.getItem("authToken");
                if (token) {
                    cachedToken = token; // تحديث الكاش
                    console.log(
                        "🔵 Interceptor: تم استعادة التوكن من AsyncStorage إلى الكاش",
                    );
                }
            }
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log(
                    "🔵 Interceptor: تم إضافة التوكن إلى الطلب، أول 10 أحرف:",
                    token.substring(0, 10),
                );
            } else {
                console.log(
                    "🔴 Interceptor: لا يوجد توكن في الكاش أو AsyncStorage",
                );
            }
        } catch (e) {
            console.error("🔴 Interceptor: خطأ في قراءة التوكن", e);
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ==================== المصادقة ====================
export const authAPI = {
    login: async (credentials) => {
        console.log("🔵 authAPI.login: إرسال طلب تسجيل الدخول");
        const response = await api.post("/auth/login", credentials);
        console.log("🔵 authAPI.login: استجابة الخادم:", response.data);
        if (response.data.success && response.data.data) {
            return response.data;
        }
        throw new Error("استجابة غير صحيحة من الخادم");
    },

    register: async (userData) => {
        const response = await api.post("/auth/register", userData);
        if (response.data.success && response.data.data) {
            return response.data;
        }
        throw new Error("استجابة غير صحيحة من الخادم");
    },

    logout: async () => ({ success: true }),

    checkAuth: async () => {
        const token = await AsyncStorage.getItem("authToken");
        const userStr = await AsyncStorage.getItem("user");
        if (token && userStr) {
            return { isAuthenticated: true, token, user: JSON.parse(userStr) };
        }
        return { isAuthenticated: false };
    },
};

// ==================== المشاريع ====================
export const projectsAPI = {
    list: (params = {}) =>
        api.get("/projects", { params }).then((res) => res.data),

    getAll: async () => {
        const response = await api.get("/projects");
        let projects = [];
        if (Array.isArray(response.data)) {
            projects = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
            projects = response.data.data;
        }
        return { success: true, data: projects };
    },

    get: (id) => api.get(`/projects/${id}`).then((res) => res.data),

    create: (formData) =>
        api
            .post("/projects", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((res) => res.data),

    update: (id, formData) =>
        api
            .put(`/projects/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((res) => res.data),

    delete: (id) => api.delete(`/projects/${id}`).then((res) => res.data),

    rate: (id, data) =>
        api.post(`/projects/${id}/rate`, data).then((res) => res.data),

    getMyProjects: async () => {
        const response = await api.get("/projects/my");
        return { success: true, data: response.data };
    },

    // دوال المشرف
    getPendingProjects: () =>
        api.get("/projects/admin/pending").then((res) => res.data),

    reviewProject: (id, action, rejectionReason) =>
        api
            .put(`/projects/${id}/review`, { action, rejectionReason })
            .then((res) => res.data),

    adminList: (params = {}) =>
        api.get("/projects/admin/all", { params }).then((res) => res.data),
};

// ==================== المستخدمين ====================
export const usersAPI = {
    getProfile: async () => {
        const response = await api.get("/auth/me");
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    getUserProfile: async (userId) => {
        const response = await api.get(`/users/${userId}`);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },

    updateProfile: async (formData) => {
        const response = await api.put("/users/profile", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    // دوال المشرف
    getAllUsers: (params = {}) =>
        api.get("/users", { params }).then((res) => res.data),

    updateUserRole: (userId, role) =>
        api.put(`/users/${userId}/role`, { role }).then((res) => res.data),

    toggleUserStatus: (userId) =>
        api.put(`/users/${userId}/toggle-status`).then((res) => res.data),

    deleteUser: (userId) =>
        api.delete(`/users/${userId}`).then((res) => res.data),
};

// ==================== التعليقات ====================
export const commentAPI = {
    getComments: (projectId) =>
        api.get(`/comments/project/${projectId}`).then((res) => res.data),
    addComment: (projectId, content) =>
        api.post("/comments", { projectId, content }).then((res) => res.data),
    deleteComment: (commentId) =>
        api.delete(`/comments/${commentId}`).then((res) => res.data),
};

// ==================== الإعجابات ====================
export const likeAPI = {
    likeProject: (projectId) =>
        api.post(`/projects/${projectId}/like`).then((res) => res.data),
    unlikeProject: (projectId) =>
        api.delete(`/projects/${projectId}/like`).then((res) => res.data),
    checkLikeStatus: (projectId) =>
        api.get(`/projects/${projectId}/like/status`).then((res) => res.data),
};

// ==================== المتابعة ====================
export const followAPI = {
    followUser: (userId) =>
        api.post(`/follow/${userId}`).then((res) => res.data),
    unfollowUser: (userId) =>
        api.delete(`/follow/${userId}`).then((res) => res.data),
    checkFollowStatus: (userId) =>
        api.get(`/follow/status/${userId}`).then((res) => res.data),
    getFollowers: (userId) =>
        api.get(`/follow/followers/${userId}`).then((res) => res.data),
    getFollowing: (userId) =>
        api.get(`/follow/following/${userId}`).then((res) => res.data),
    getUserStats: (userId) =>
        api.get(`/users/${userId}/stats`).then((res) => res.data),
    getUserStats: async (userId) => {
        try {
            const response = await api.get(`/users/${userId}/stats`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                console.log(
                    "⚠️ مسار الإحصائيات غير موجود، استخدام بيانات افتراضية",
                );
                return {
                    success: true,
                    data: {
                        followersCount: 0,
                        followingCount: 0,
                        projectsCount: 0,
                        likesCount: 0,
                    },
                };
            }
            throw error;
        }
    },
};

export default api;
