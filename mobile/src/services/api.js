// mobile/src/services/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:5000/api";

console.log("📡 عنوان API:", API_URL);

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
});

// إضافة التوكن تلقائياً إلى كل طلب
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ==================== المصادقة ====================
export const authAPI = {
    login: async (credentials) => {
        const response = await api.post("/auth/login", credentials);
        // نتوقع استجابة بالشكل: { success: true, data: { token, user } }
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

    logout: async () => {
        // لا حاجة لإرسال طلب للخادم عادةً، فقط نمسح محلياً
        return { success: true };
    },

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
    // جلب المشاريع العامة (المقبولة فقط) مع فلترة
    list: (params = {}) => api.get("/projects", { params }),

    // دالة getAll للتوافق مع الكود القديم
    getAll: async () => {
        const response = await api.get("/projects");
        // نتوقع أن يعيد الخادم مصفوفة مباشرة
        let projects = [];
        if (Array.isArray(response.data)) {
            projects = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
            projects = response.data.data;
        }
        return { success: true, data: projects };
    },

    // جلب مشروع معين
    get: (id) => api.get(`/projects/${id}`),

    // إنشاء مشروع جديد (يدعم رفع الصور)
    create: (formData) =>
        api.post("/projects", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    // تحديث مشروع
    update: (id, formData) =>
        api.put(`/projects/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),

    // حذف مشروع
    delete: (id) => api.delete(`/projects/${id}`),

    // تقييم مشروع
    rate: (id, data) => api.post(`/projects/${id}/rate`, data),

    // جلب مشاريع المستخدم الحالي (جميع الحالات)
    getMyProjects: async () => {
        const response = await api.get("/projects/my");
        return { success: true, data: response.data };
    },

    // جلب المشاريع المعلقة (للمشرف فقط)
    getPendingProjects: () => api.get("/projects/admin/pending"),

    // مراجعة مشروع (قبول/رفض)
    reviewProject: (id, action, rejectionReason) =>
        api.put(`/projects/${id}/review`, { action, rejectionReason }),

    // جميع المشاريع (للمشرف فقط)
    adminList: () => api.get("/projects/admin/all"),
};

// ==================== المستخدمين ====================
export const usersAPI = {
    getProfile: () => api.get("/auth/me"),
    getUserProfile: (userId) => api.get(`/users/${userId}`),
    updateProfile: (formData) =>
        api.put("/users/profile", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
};

// ==================== التعليقات ====================
export const commentAPI = {
    getComments: (projectId) => api.get(`/comments/project/${projectId}`),
    addComment: (projectId, content) =>
        api.post("/comments", { projectId, content }),
    deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

// ==================== الإعجابات ====================
export const likeAPI = {
    likeProject: (projectId) => api.post(`/projects/${projectId}/like`),
    unlikeProject: (projectId) => api.delete(`/projects/${projectId}/like`),
    checkLikeStatus: (projectId) =>
        api.get(`/projects/${projectId}/like/status`),
};

// ==================== المتابعة ====================
export const followAPI = {
    followUser: (userId) => api.post(`/follow/${userId}`),
    unfollowUser: (userId) => api.delete(`/follow/${userId}`),
    checkFollowStatus: (userId) => api.get(`/follow/status/${userId}`),
    getFollowers: (userId) => api.get(`/follow/followers/${userId}`),
    getFollowing: (userId) => api.get(`/follow/following/${userId}`),
    getUserStats: (userId) => api.get(`/users/${userId}/stats`),
};

export default api;
