import { Constants } from '@/config/constants';

export const BASE_URL =Constants.BASE_URL


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

  VENDOR_ROUTES: {
    CREATE: '/vendor/routes',
    ALL: '/vendor/routes/all',
    CANCEL: (id: string) => `/vendor/routes/${id}/cancel`,
    UPDATE: (id: string) => `/vendor/routes/${id}`,
    DETAILS: (id: string) => `/vendor/routes/${id}`,
  },
  ORDERS: {
    CREATE: '/user/orders',
    HISTORY: '/user/orders/history',
  },
};
