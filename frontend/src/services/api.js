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
    // accept optional params object: { userId, category, ... }
    list: (params) => api.get("/projects", { params }),
    get: (id) => api.get(`/projects/${id}`),
    create: (formData) => api.post("/projects", formData),
    delete: (id) => api.delete(`/projects/${id}`),
    rate: (id, payload) => api.post(`/projects/${id}/rate`, payload),
    adminList: () => api.get("/projects/admin/all"),
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
