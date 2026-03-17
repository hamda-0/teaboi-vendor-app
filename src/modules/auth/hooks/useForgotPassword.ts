import { useState } from 'react';
import { forgotPasswordSchema } from '@utils/schemas';
import { useFormValidation } from '@shared/hooks/useFormValidation';
import { authService } from '../services/authService';
import { Alert } from 'react-native';
import { navigate } from '@navigation/navigationRef';

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { validate } = useFormValidation(forgotPasswordSchema);

  const handleForgotPassword = async (values: any) => {
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(values.email);
      console.log('Forgot password success:', response);
      navigate('OtpVerification', { email: values.email, flow: 'forgot_password' })
    } catch (err: any) {
      console.log('Forgot password error:', err.error);
      Alert.alert('Error', err.error || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleForgotPassword,
    validate,
    isLoading,
    initialValues: { email: '' },
  };
};
