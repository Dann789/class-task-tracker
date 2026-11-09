import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menambahkan Bearer Token pada setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tasktracker_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk menangani error response secara terpusat
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika token kedaluwarsa atau tidak valid (401), bersihkan penyimpanan
    if (error.response && error.response.status === 401) {
      const isAuthRequest = error.config.url.includes("/auth/login") || error.config.url.includes("/auth/register");
      if (!isAuthRequest) {
        localStorage.removeItem("tasktracker_token");
        localStorage.removeItem("tasktracker_user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

