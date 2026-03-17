import axios from 'axios';
import { BASE_URL } from '@/api/endpoints';
import { ApiErrorResponse } from '@/types/api';
import { isDev } from '@/utils/platform';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    try {
      const { useAuthStore } = require('@store/useAuthStore');
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (isDev) {
        console.log('API Request:', {
          url: config.url,
          method: config.method,
          params: config.params,
        });
      }

    } catch (e) {
      if (isDev) {
        console.log('Token interceptor error:', e);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    const apiRes = response.data;

    if (apiRes.error || (apiRes.statusCode && apiRes.statusCode >= 400)) {

      if (isDev) {
        console.log('API Error:', {
          url: response.config?.url,
          method: response.config?.method,
          statusCode: apiRes.statusCode,
          error: apiRes.error,
          requestBody: response.config?.data,
          response: apiRes,
        });
      }

      return Promise.reject(apiRes);
    }

    return apiRes;
  },
  (error) => {

    if (error.response?.data) {
      const apiRes = error.response.data as ApiErrorResponse;

      if (isDev) {
        console.log('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          statusCode: apiRes.statusCode || error.response.status,
          error: apiRes.error,
          requestBody: error.config?.data,
          response: apiRes,
        });
      }

      return Promise.reject({
        statusCode: apiRes.statusCode || error.response.status,
        data: apiRes.data || null,
        error: apiRes.error || error.message || 'Something went wrong',
        message: apiRes.message,
      });
    }

    // Network error
    if (isDev) {
      console.log('Network Error:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
      });
    }

    return Promise.reject({
      statusCode: 500,
      data: null,
      error: error.message || 'Network Error',
    });
  }
);

export default apiClient;