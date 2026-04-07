import axios from 'axios';
import { BASE_URL } from '@/api/endpoints';
import { ApiErrorResponse } from '@/types/api';
import { isDev } from '@/utils/platform';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
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
          base:config.baseURL,
          data:config.data
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


    // Check if the response data itself contains an error message or 401 status
    if (apiRes.error || (apiRes.statusCode && apiRes.statusCode >= 400)) {
      const isUnauthorized = 
        apiRes.statusCode === 401 ;
      if (isUnauthorized) {
        try {
          const { useAuthStore } = require('@store/useAuthStore');
          const { navigate } = require('@navigation/navigationRef');
          useAuthStore.getState().logout();
          setTimeout(() => navigate('Login'), 100);
        } catch (e) {
          if (isDev) console.log('Logout error in interceptor:', e);
        }
      }

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
      const statusCode = apiRes.statusCode || error.response.status;

      // Handle 401 Unauthorized from error response
      const isUnauthorized = 
        statusCode === 401 || 
        (apiRes.error && (
          apiRes.error.toLowerCase().includes('user not found') || 
          apiRes.error.toLowerCase().includes('unauthori')
        ));

      if (isUnauthorized) {
        try {
          const { useAuthStore } = require('@store/useAuthStore');
          const { navigate } = require('@navigation/navigationRef');
          useAuthStore.getState().logout();
          setTimeout(() => navigate('Login'), 100);
        } catch (e) {
          if (isDev) console.log('Logout error in interceptor:', e);
        }
      }

      if (isDev) {
        console.log('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          statusCode: statusCode,
          error: apiRes.error,
          requestBody: error.config?.data,
          response: apiRes,
        });
      }

      return Promise.reject({
        statusCode: statusCode,
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