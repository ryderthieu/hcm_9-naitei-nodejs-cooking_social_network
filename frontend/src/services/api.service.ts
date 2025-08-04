import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";

let accessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000/api";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await refreshAccessToken();
        const newToken = response.data.accessToken;

        setAccessToken(newToken);

        processQueue(null, newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

async function refreshAccessToken(): Promise<AxiosResponse> {
  const refreshInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 5000,
  });

  return refreshInstance.post("/auth/refresh");
}

function processQueue(error: any, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
}

export function setAccessToken(token: string): void {
  accessToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
  }
}

export function getAccessToken(): string | null {
  if (!accessToken && typeof window !== "undefined") {
    accessToken = localStorage.getItem("accessToken");
  }
  return accessToken;
}

export function clearAuth(): void {
  accessToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
  }
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: any;
}

export async function get<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await api.get(url, config);
    return {
      data: response.data,
      status: response.status,
      message: response.data?.message,
    };
  } catch (error: any) {
    throw handleError(error);
  }
}

export async function post<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await api.post(url, data, config);
    return {
      data: response.data,
      status: response.status,
      message: response.data?.message,
    };
  } catch (error: any) {
    throw handleError(error);
  }
}

export async function put<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await api.put(url, data, config);
    return {
      data: response.data,
      status: response.status,
      message: response.data?.message,
    };
  } catch (error: any) {
    throw handleError(error);
  }
}

export async function del<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await api.delete(url, config);
    return {
      data: response.data,
      status: response.status,
      message: response.data?.message,
    };
  } catch (error: any) {
    throw handleError(error);
  }
}

export async function uploadFile<T = any>(
  url: string,
  file: File,
  onUploadProgress?: (progressEvent: any) => void
): Promise<ApiResponse<T>> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
    return {
      data: response.data,
      status: response.status,
      message: response.data?.message,
    };
  } catch (error: any) {
    throw handleError(error);
  }
}

function handleError(error: any): ApiError {
  if (error.response) {
    return {
      message: error.response.data?.message || "An error occured from server",
      status: error.response.status,
      errors: error.response.data?.errors,
    };
  } else if (error.request) {
    return {
      message: "Cannot connect to server",
      status: 0,
    };
  } else {
    return {
      message: error.message || "An error occured",
      status: 0,
    };
  }
}

export default api;
