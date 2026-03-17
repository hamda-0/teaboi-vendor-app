import { Constants } from '@/config/constants';

export const BASE_URL = "http://192.168.100.209:3001"


export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register/vendor',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',//reset with new pswrd
    LOGOUT: '/auth/logout',
    GOOGLE_LOGIN: '/auth/google-login',
    APPLE_LOGIN: '/auth/apple-login',
  },
  PROFILE: {
    ME: '/vendor/profile',
    UPDATE: '/vendor/profile/update',
    DELETE: '/user/profile/me',
    LOCATION: '/user/profile/location',
    COMPLETE_VENDOR_PROFILE: '/vendor/profile/complete',
  },
  MEDIA:{
    UPLOAD:'/upload'
  },

  // PRODUCTS: {
  //   LIST: '/products',
  //   DETAILS: (id) => `/products/${id}`,
  //   CATEGORIES: '/categories',
  // },

  MENU: {
    CREATE: '/menu',
  },

  CATEGORIES: {
    ALL: '/admin/categories/all',
  },

  ORDERS: {
    CREATE: '/user/orders',
    HISTORY: '/user/orders/history',
  },
};
