import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ashutoshcodes.me/api';
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration or errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const message = error.response.data?.message;
      if (message && message.includes('expired')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login/student?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
