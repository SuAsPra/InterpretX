import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${apiBase}/api`
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('narrative_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
