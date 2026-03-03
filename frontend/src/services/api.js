import axios from "axios";

const api = axios.create({
    // baseURL: process.env.REACT_APP_API_BASE || "http://localhost:5000/api",
    baseURL:
        process.env.REACT_APP_API_BASE ||
        "https://techfolio-kohl.vercel.app/api",
});

api.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        // ignore
    }
    return config;
});

// ==================== AUTH API ====================
const authAPI = {
    login: (credentials) => api.post("/auth/login", credentials),
    register: (payload) => {
        if (payload instanceof FormData) {
            return api.post("/auth/register", payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        }
        return api.post("/auth/register", payload);
    },
    getMe: () => api.get("/auth/me"),
    changePassword: (passwords) => api.post("/auth/change-password", passwords),
    verifyToken: () => api.get("/auth/verify-token"),
};

// ==================== USERS API ====================
const usersAPI = {
    // الحصول على ملف مستخدم معين
    getProfile: (id) => api.get(`/users/${id}`),

    // تحديث الملف الشخصي (يدعم الصور)
    updateProfile: (payload) => {
        if (payload instanceof FormData) {
            return api.put(`/users/profile`, payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        }
        return api.put(`/users/profile`, payload);
    },

    // الحصول على جميع المستخدمين (عام)
    getAll: (params) => api.get("/users", { params }),

    // البحث عن مستخدمين
    search: (query) => api.get(`/users/search/${query}`),

    // متابعة مستخدم
    follow: (userId) => api.post(`/follow/${userId}`),

    // إلغاء متابعة مستخدم
    unfollow: (userId) => api.delete(`/follow/${userId}`),

    // التحقق من حالة المتابعة
    checkFollow: (userId) => api.get(`/follow/check/${userId}`),

    // الحصول على المتابعين
    getFollowers: (userId, page = 1, limit = 20) =>
        api.get(`/follow/followers/${userId}`, { params: { page, limit } }),

    // الحصول على المستخدمين الذين يتابعهم
    getFollowing: (userId, page = 1, limit = 20) =>
        api.get(`/follow/following/${userId}`, { params: { page, limit } }),
};

// ==================== PROJECTS API ====================
const projectsAPI = {
    // الحصول على قائمة المشاريع العامة (المقبولة فقط)
    list: (params) => api.get("/projects", { params }),

    // الحصول على مشروع معين
    get: (id) => api.get(`/projects/${id}`),

    // إنشاء مشروع جديد
    create: (formData) => api.post("/projects", formData),

    // حذف مشروع
    delete: (id) => api.delete(`/projects/${id}`),

    // تقييم مشروع (للمعلمين)
    rate: (id, payload) => api.post(`/projects/${id}/rate`, payload),

    // الحصول على جميع المشاريع (للمشرف فقط)
    adminList: () => api.get("/projects/admin/all"),

    // الحصول على مشاريع المستخدم الحالي
    getMyProjects: () => api.get("/projects/my"),

    // الحصول على المشاريع المعلقة (للمشرف فقط)
    getPendingProjects: () => api.get("/projects/admin/pending"),

    // مراجعة مشروع (قبول أو رفض) - للمشرف فقط
    reviewProject: (id, action, rejectionReason) => {
        const payload = { action };
        if (rejectionReason) payload.rejectionReason = rejectionReason;
        return api.put(`/projects/${id}/review`, payload);
    },

    // الحصول على مشروع للتعديل
    getForEdit: (id) => api.get(`/projects/${id}`),

    // تحديث مشروع
    update: (id, formData) => api.put(`/projects/${id}`, formData),

    // الحصول على مشاريع مميزة
    getFeatured: (limit = 6) =>
        api.get("/projects/featured", { params: { limit } }),

    // الحصول على مشاريع حسب الفئة
    getByCategory: (category, page = 1, limit = 10) =>
        api.get(`/projects/category/${category}`, { params: { page, limit } }),
    // admin view all projects
    getProjectForAdmin: (id) => api.get(`/projects/admin/${id}`),
    // زيادة عدد المشاهدات
    incrementViews: (id) => api.post(`/projects/${id}/views`),
};

// ==================== COMMENTS API ====================
const commentAPI = {
    // الحصول على تعليقات مشروع
    getProjectComments: (projectId, page = 1, limit = 20) =>
        api.get(`/comments/project/${projectId}`, { params: { page, limit } }),

    // إضافة تعليق
    addComment: (projectId, content, parentComment = null) => {
        const payload = { projectId, content };
        if (parentComment) payload.parentComment = parentComment;
        return api.post("/comments", payload);
    },

    // تحديث تعليق
    updateComment: (commentId, content) =>
        api.put(`/comments/${commentId}`, { content }),

    // حذف تعليق
    deleteComment: (commentId) => api.delete(`/comments/${commentId}`),

    // إعجاب بتعليق
    toggleLike: (commentId) => api.post(`/comments/${commentId}/like`),

    // الحصول على ردود تعليق
    getReplies: (commentId, page = 1, limit = 10) =>
        api.get(`/comments/${commentId}/replies`, { params: { page, limit } }),
};

// ==================== NOTIFICATIONS API ====================
const notificationAPI = {
    // الحصول على الإشعارات
    getNotifications: (page = 1, limit = 20) =>
        api.get("/notifications", { params: { page, limit } }),

    // إنشاء إشعار جديد (للاستخدام الداخلي)
    createNotification: (data) => api.post("/notifications", data),

    // وضع علامة كمقروء
    markAsRead: (notificationId) =>
        api.put(`/notifications/${notificationId}/read`),

    // وضع علامة على جميع الإشعارات كمقروءة
    markAllAsRead: () => api.put("/notifications/read-all"),

    // حذف إشعار
    deleteNotification: (notificationId) =>
        api.delete(`/notifications/${notificationId}`),

    // حذف جميع الإشعارات
    clearAll: () => api.delete("/notifications/clear"),

    // الحصول على عدد الإشعارات غير المقروءة
    getUnreadCount: () => api.get("/notifications/unread/count"),
};

export { api, authAPI, usersAPI, projectsAPI, commentAPI, notificationAPI };
