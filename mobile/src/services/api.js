import axios from 'axios';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://10.0.2.2:5000/api';

const api = axios.create({ baseURL: API_BASE });

export const projectsAPI = {
  list: (params) => api.get('/projects', { params }),
  get: (id) => api.get(`/projects/${id}`),
};

export default api;
