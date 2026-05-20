import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { config } from "@/lib/config";

// Create axios instance
export const httpClient = axios.create({
  baseURL: config.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Get access token from memory
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

// Check if URL is an auth-related endpoint
function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  const authEndpoints = ["/auth/refresh"];
  return authEndpoints.some((endpoint) => url.includes(endpoint));
}

// Request interceptor
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Silently handle expected 401s from auth check endpoints
    if (error.response?.status === 401 && isAuthEndpoint(originalRequest?.url)) {
      // Don't clear token for /users/me - it's just checking auth status
      // But do clear for /auth/refresh failure
      if (originalRequest?.url?.includes("/auth/refresh")) {
        setAccessToken(null);
      }
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${config.apiUrl}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken: newToken } = response.data;
        setAccessToken(newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return httpClient(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
