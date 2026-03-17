import { useState } from 'react';
import { registerSchema } from '@utils/schemas';
import { useFormValidation } from '@shared/hooks/useFormValidation';
import { authService } from '../services/authService';
import { Alert } from 'react-native';
import { navigate } from '@navigation/navigationRef';

export const useSignup = (navigation: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const { validate } = useFormValidation(registerSchema);

  const handleSignup = async (values: any) => {
    setIsLoading(true);
    try {
      const response = await authService.register(values);
      navigate('OtpVerification', { email: values.email });
    } catch (err: any) {
      console.error('Signup error:', err);
      Alert.alert('Registration Failed', err.error || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSignup,
    validate,
    isLoading,
    initialValues: { name: '', email: '', password: '', phone: '' },
  };
};
