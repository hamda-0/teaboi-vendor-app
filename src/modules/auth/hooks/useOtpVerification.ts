import { useState, useRef, useEffect } from 'react';
import { authService } from '../services/authService';
import { Alert, TextInput } from 'react-native';
import { navigate, replace } from '@navigation/navigationRef';
import { useAuthStore } from '@store/useAuthStore';

export const useOtpVerification = (email: string, flow: 'forgot_password' | 'signup', codeLength = 6) => {
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const setAuth = useAuthStore((state: any) => state.setAuth);

  useEffect(() => {
    // Auto-focus the input when screen mounts
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (code.length !== codeLength) return;

    setIsLoading(true);
    try {
      const response = await authService.verifyOtp({ email, otp: code });
      console.log('OTP Verification success:', response);
      
      if (flow === 'forgot_password') {
        replace('ResetPassword', { email, otp: code });
      } else {
        const { user, accessToken } = response.data || {};
        if (accessToken) {
          setAuth(user, accessToken);
        } else {
          // Fallback, if token isn't in response let them login manually
          replace('Login');
        }
      }
    } catch (err: any) {
      console.log('OTP Verification error:', err.error);
      Alert.alert('Verification Failed', err.error || 'Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };



  const handleResend = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    try {
      console.log("resend otp is sent here>>>");
      
      await authService.resendOtp(email);
      setCountdown(30);
      Alert.alert('Success', 'Verification code resent to your email.');
    } catch (err: any) {
      console.log('Resend OTP error:', err.error);
      Alert.alert('Error', err.error || 'Failed to resend verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const onCodeChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue.length <= codeLength) setCode(numericValue);
  };

  return {
    code,
    countdown,
    isLoading,
    inputRef,
    handleVerify,
    handleResend,
    onCodeChange,
    isComplete: code.length === codeLength,
    codeDigitsArray: new Array(codeLength).fill(0),
  };
};
