import { Platform } from 'react-native';

export const isDev = __DEV__;
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';
