import axios from "axios";

// Determine API base depending on runtime environment:
// - If EXPO_PUBLIC_API_BASE is set, use it
// - If running in a web browser on localhost, use localhost:5000
// - Otherwise (Android emulator) use 10.0.2.2 to reach host machine
const envBase = process.env.EXPO_PUBLIC_API_BASE;
let API_BASE = envBase || "http://10.0.2.2:5000/api";

try {
    if (
        typeof window !== "undefined" &&
        window.location &&
        window.location.hostname
    ) {
        const host = window.location.hostname;
        if (host === "localhost" || host === "127.0.0.1") {
            API_BASE = envBase || "http://localhost:5000/api";
        }
    }
} catch (e) {
    // ignore
}

const api = axios.create({ baseURL: API_BASE });

export const projectsAPI = {
    list: (params) => api.get("/projects", { params }),
    get: (id) => api.get(`/projects/${id}`),
    create: (formData) => api.post('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const authAPI = {
    login: (cred) => api.post('/auth/login', cred),
    register: (payload) => api.post('/auth/register', payload),
};
};
export const usersAPI = {
    getProfile: (id) => api.get(`/users/${id}`),
    updateProfile: (payload) => api.put('/users/profile', payload),
};

export default api;
