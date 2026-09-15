import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '../stores/auth-store';
import { useLanguageStore } from '../stores/language-store';
import {
  ApiResponse,
  ApiErrorPayload,
  BulkCreateUnitsPayload,
  BulkCreateUnitsResult,
  ChangePasswordInput,
  CreateUnitInput,
  ForgotPasswordInput,
  Property,
  PropertySummary,
  ResetPasswordInput,
  Unit,
  VerifyResetOtpInput,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not configured.');
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return error.response?.data?.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

// Request Interceptor: Attach Token & Language
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Auth token
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Language header
    const lang = useLanguageStore.getState().language || 'bn';
    if (config.headers) {
      config.headers['Accept-Language'] = lang;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Refresh Token and Standard Envelope
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Return standard data payload if wrapped
    return response;
  },
  async (error: AxiosError<ApiErrorPayload>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry if it's already the login, register or refresh endpoint
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        processQueue(error);
        isRefreshing = false;
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post<ApiResponse<{ accessToken: string; refreshToken?: string }>>(
          `${API_URL}/auth/refresh`,
          { refreshToken }
        );

        if (refreshResponse.data?.success && refreshResponse.data.data?.accessToken) {
          const newAccessToken = refreshResponse.data.data.accessToken;
          const newRefreshToken = refreshResponse.data.data.refreshToken || refreshToken;

          useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        }

        throw new Error('Token refresh response did not contain an access token.');
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Domain API methods keep transport details out of UI components.
export const propertiesApi = {
  get: (propertyId: string) => apiClient.get<ApiResponse<Property>>(`/properties/${propertyId}`),
  getSummary: (propertyId: string) =>
    apiClient.get<ApiResponse<PropertySummary>>(`/properties/${propertyId}/summary`),
};

export const unitsApi = {
  listByProperty: (propertyId: string) =>
    apiClient.get<ApiResponse<Unit[]>>(`/properties/${propertyId}/units?limit=100`),
  create: (propertyId: string, payload: CreateUnitInput) =>
    apiClient.post<ApiResponse<Unit>>(`/properties/${propertyId}/units`, payload),
  update: (unitId: string, payload: Partial<Unit>) => apiClient.patch<ApiResponse<Unit>>(`/units/${unitId}`, payload),
  remove: (unitId: string) => apiClient.delete(`/units/${unitId}`),
  bulkCreate: (propertyId: string, payload: BulkCreateUnitsPayload) =>
    apiClient.post<ApiResponse<BulkCreateUnitsResult>>(`/properties/${propertyId}/units/bulk`, payload),
};

export const authApi = {
  changePassword: (payload: ChangePasswordInput) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/change-password', payload),
  forgotPassword: (payload: ForgotPasswordInput) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', payload),
  verifyResetOtp: (payload: VerifyResetOtpInput) =>
    apiClient.post<ApiResponse<{ resetToken: string; message: string }>>('/auth/verify-password-reset', payload),
  resetPassword: (payload: ResetPasswordInput) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', payload),
};

