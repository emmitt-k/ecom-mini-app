import axios, { AxiosError } from "axios";
import { config } from "./config";

// Token storage key
const ACCESS_TOKEN_KEY = "access_token";

// Create axios instance
export const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important: allows httpOnly cookies (refresh token)
});

// Get access token from memory (not localStorage for security)
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

// Request interceptor - add access token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // If 401 and not a refresh request, try to refresh token
    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      try {
        // Refresh token is sent automatically via httpOnly cookie
        const response = await axios.post(
          `${config.apiUrl}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const { accessToken: newToken } = response.data;
        setAccessToken(newToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear token and redirect to login
        setAccessToken(null);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
