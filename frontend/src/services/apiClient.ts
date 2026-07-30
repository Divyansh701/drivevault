import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';

// ─── Base client ──────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request interceptor — attach JWT ─────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('dv_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor — normalize errors ──────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Only redirect to login on 401 if the user was previously authenticated.
    // If no token exists in storage, they are browsing as a guest and a 401
    // on a public/optional-auth endpoint (GET /vehicles) should NOT redirect.
    if (error.response?.status === 401) {
      const hasToken = Boolean(localStorage.getItem('dv_token'));
      if (hasToken) {
        // Token existed but was rejected — clear it and redirect to login
        localStorage.removeItem('dv_token');
        window.location.href = '/login';
      }
      // No token = guest browsing a protected endpoint — let caller handle the error
    }

    // Normalize the error object
    const apiError: ApiError = {
      message:
        error.response?.data?.message ??
        error.message ??
        'An unexpected error occurred.',
      statusCode: error.response?.status ?? 0,
      errors: error.response?.data?.errors,
    };

    return Promise.reject(apiError);
  },
);

export default apiClient;
