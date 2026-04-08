import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  initAuth,
  logout,
  saveToken,
} from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      logout();
      return Promise.reject(error);
    }

    try {
      const res = await axios.post(`${API_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      saveToken(
        res.data.access_token,
        res.data.refresh_token,
        res.data.refresh_expires_at,
      );
      initAuth();

      originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
      return api(originalRequest);
    } catch {
      logout();
      return Promise.reject(error);
    }
  },
);

export default api;
