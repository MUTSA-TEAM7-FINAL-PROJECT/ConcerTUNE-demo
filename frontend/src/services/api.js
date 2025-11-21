import axios from "axios";
import StorageService from "./storage";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = StorageService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (response) => response, // 성공 응답은 그대로 통과
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response && error.response.status === 401;
    
    if (isUnauthorized && !originalRequest._retry) {
      originalRequest._retry = true; 
      
      try {
        const refreshToken = StorageService.getRefreshToken(); 

        if (!refreshToken) {
            throw new Error("No refresh token available.");
        }
        
        const refreshResponse = await refreshApi.post('/auth/refresh', 
            null, 
            { 
                headers: { 
                    'X-Refresh-Token': refreshToken
                } 
            }
        ); 
        
        const { accessToken: newAccessToken } = refreshResponse.data;
        StorageService.setAccessToken(newAccessToken); 
        
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        console.error("Token refresh failed, forcing logout:", refreshError);
        StorageService.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;