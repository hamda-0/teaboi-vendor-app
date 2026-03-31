import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import { LoginResponseData } from '@/types/auth';

export const authService = {
  login: async (credentials: any): Promise<ApiResponse<LoginResponseData>> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
    // console.log(response,"response;s,s,s,s,s")
    return response;
  },
  
  register: async (userData: any) => {
    return await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
  },
  
  verifyOtp: async (data: any) => {
    return await apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, data);
  },
  
  resendOtp: async (email: any) => {
    return await apiClient.post(ENDPOINTS.AUTH.RESEND_OTP, { email });
  },
  
  forgotPassword: async (email: any) => {
    return await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  resetPassword: async (data: any) => {
    return await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },

  
  logout: async () => {
    return await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  },
  
  googleLogin: async (data: any) => {
    return await apiClient.post(ENDPOINTS.AUTH.GOOGLE_LOGIN, data);
  },

  appleLogin: async (data: any) => {
    return await apiClient.post(ENDPOINTS.AUTH.APPLE_LOGIN, data);
  },
};
