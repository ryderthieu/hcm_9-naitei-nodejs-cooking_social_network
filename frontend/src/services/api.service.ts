import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import axios from "axios";
import {
  API_CONSTANTS,
  HTTP_STATUS,
  STORAGE_KEYS,
  API_ERROR_MESSAGES,
} from "../constants/constants";

let accessToken: string | null = (typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) : null);
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const api: AxiosInstance = axios.create({
  baseURL: API_CONSTANTS.BASE_URL,
  withCredentials: true,
  timeout: API_CONSTANTS.TIMEOUT,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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
      error.response?.status === HTTP_STATUS.UNAUTHORIZED &&
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
    baseURL: API_CONSTANTS.BASE_URL,
    withCredentials: true,
    timeout: API_CONSTANTS.REFRESH_TIMEOUT,
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
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }
}

export function getAccessToken(): string | null {
  if (!accessToken && typeof window !== "undefined") {
    accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }
  return accessToken;
}

export function clearAuth(): void {
  accessToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
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



function handleError(error: any): ApiError {
  if (error.response) {
    return {
      message: error.response.data?.message || API_ERROR_MESSAGES.SERVER_ERROR,
      status: error.response.status,
      errors: error.response.data?.errors,
    };
  } else if (error.request) {
    return {
      message: API_ERROR_MESSAGES.CONNECTION_ERROR,
      status: 0,
    };
  } else {
    return {
      message: error.message || API_ERROR_MESSAGES.GENERAL_ERROR,
      status: 0,
    };
  }
}

export default api;
