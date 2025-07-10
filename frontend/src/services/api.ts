import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000") + "/api", // Backend Node.js
  headers: {
    "Content-Type": "application/json",
  },
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000, // Timeout configurável
});

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.VITE_LOG_LEVEL === 'debug') {
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
