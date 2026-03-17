import { useState } from 'react';
import { resetPasswordSchema } from '@utils/schemas';
import { useFormValidation } from '@shared/hooks/useFormValidation';
import { authService } from '../services/authService';
import { Alert } from 'react-native';
import { replace } from '@navigation/navigationRef';

export const useResetPassword = (email: string, otp: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { validate } = useFormValidation(resetPasswordSchema);

  const handleResetPassword = async (values: any) => {
    setIsLoading(true);
    try {
      const response = await authService.resetPassword({
        email,
        newPassword: values.password,
      });
      console.log('Reset password success:', response);
      
      Alert.alert(
        'Success', 
        'Password reset successfully. Please login with your new password.',
        [
          { 
            text: 'Login Now', 
            onPress: () => replace('Login') 
          }
        ]
      );
    } catch (err: any) {
      console.log('Reset password error:', err.error);
      Alert.alert('Error', err.error || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleResetPassword,
    validate,
    isLoading,
    initialValues: { password: '', confirmPassword: '' },
  };
};
