import { useState } from 'react';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

import { authService } from '../services/authService';
import { useAuthStore } from '@store/useAuthStore';
import { navigate } from '@navigation/navigationRef';
import { Alert, Platform } from 'react-native';

export const useSocialAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state: any) => state.setAuth);

  const handleGoogleSignInSuccess = async (googleResponse: any) => {
    try {
      const response = await authService.googleLogin({
        idToken: googleResponse.idToken,
        user: googleResponse.user,
      });

      const { user, accessToken } = response.data;
      setAuth(user, accessToken);
    } catch (err: any) {
      console.error('Backend Google login error:', err);
      Alert.alert('Login Failed', err.error || 'Failed to authenticate with server.');
    }
  };

  const startGoogleSignInFlow = async () => {
    setIsLoading(true);
    try {
      const signInResponse = await GoogleSignin.signIn();
      
      if (signInResponse.type === 'success') {
        await handleGoogleSignInSuccess(signInResponse.data);
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled Google sign in');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in already in progress');
      } else {
        console.log('Google Sign-In Error:', error);
        Alert.alert('Error', 'An unexpected error occurred during Google Sign-In');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startAppleSignInFlow = async () => {
    if (Platform.OS !== 'ios') return;

    setIsLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const response = await authService.appleLogin({
        identityToken: credential.identityToken,
        fullName: credential.fullName,
        email: credential.email,
        user: credential.user,
      });

      const { user, accessToken } = response.data;
      setAuth(user, accessToken);
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        console.log('User cancelled Apple sign in');
      } else {
        console.error('Apple login error:', e);
        Alert.alert('Login Failed', e.error || 'Failed to authenticate with Apple.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startGoogleSignInFlow,
    startAppleSignInFlow,
    isLoading,
  };
};
