import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE || "http://localhost:5000/api",
});

// attach auth token from localStorage to every request if present
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
};

const usersAPI = {
    getProfile: (id) => api.get(`/users/${id}`),
    // backend expects PUT /api/users/profile for authenticated user's profile
    updateProfile: (payload) => api.put(`/users/profile`, payload),
};

const projectsAPI = {
    // الحصول على قائمة المشاريع العامة (المقبولة فقط)
    list: (params) => api.get("/projects", { params }),

    // الحصول على مشروع معين (يجب أن يكون مقبولاً)
    get: (id) => api.get(`/projects/${id}`),

    // إنشاء مشروع جديد (للمستخدمين العاديين)
    create: (formData) => api.post("/projects", formData),

    // حذف مشروع (للمالك أو المشرف)
    delete: (id) => api.delete(`/projects/${id}`),

    // تقييم مشروع (للمعلمين)
    rate: (id, payload) => api.post(`/projects/${id}/rate`, payload),

    // الحصول على جميع المشاريع (للمشرف فقط)
    adminList: () => api.get("/projects/admin/all"),

    // الحصول على مشاريع المستخدم الحالي (بما في ذلك المعلقة والمرفوضة)
    getMyProjects: () => api.get("/projects/my"),

    // الحصول على المشاريع المعلقة (للمشرف فقط)
    getPendingProjects: () => api.get("/projects/admin/pending"),

    // مراجعة مشروع (قبول أو رفض) - للمشرف فقط
    reviewProject: (id, action, rejectionReason) =>
        api.put(`/projects/${id}/review`, { action, rejectionReason }),
};

const commentAPI = {
    getProjectComments: (projectId, page = 1, limit = 20) =>
        api.get(`/comments/project/${projectId}`, { params: { page, limit } }),

    addComment: (projectId, content, parentComment) => {
        const payload = { projectId, content };
        if (parentComment) payload.parentComment = parentComment;
        return api.post("/comments", payload);
    },

    deleteComment: (commentId) => api.delete(`/comments/${commentId}`),

    toggleLike: (commentId) => api.post(`/comments/${commentId}/like`),
};

export { api, authAPI, usersAPI, projectsAPI, commentAPI };
