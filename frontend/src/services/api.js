import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE || "http://localhost:5000/api",
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
    create: (formData) =>
        api.post("/projects", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
};

const commentAPI = {
    getProjectComments: (projectId, page = 1, limit = 20) =>
        api.get(`/comments/project/${projectId}`, { params: { page, limit } }),

    addComment: (projectId, content, parentComment) => {
        const payload = { projectId, content };
        if (parentComment) payload.parentComment = parentComment;
        const token = localStorage.getItem("authToken");
        return api.post("/comments", payload, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    deleteComment: (commentId) => {
        const token = localStorage.getItem("authToken");
        return api.delete(`/comments/${commentId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },

    toggleLike: (commentId) => {
        const token = localStorage.getItem("authToken");
        return api.post(
            `/comments/${commentId}/like`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );
    },
};

export { api, authAPI, usersAPI, projectsAPI, commentAPI };
