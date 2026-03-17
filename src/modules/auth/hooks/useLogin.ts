import { loginSchema } from '@utils/schemas';
import { navigate } from '@navigation/navigationRef';
import { useFormValidation } from '@shared/hooks/useFormValidation';
import { authService } from '../services/authService';
import { Alert } from 'react-native';
import { useAuthStore } from '@store/useAuthStore';
import { useMutation } from '@tanstack/react-query';
import { ApiResponse } from '@/types/api';
import { AccountStatus, LoginResponseData } from '@/types/auth';

export const useLogin = () => {
  const { validate } = useFormValidation(loginSchema);
  const setAuth = useAuthStore((state: any) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: (values: any) => authService.login(values),
    onSuccess: (response: ApiResponse<LoginResponseData>) => {
      if (response.data) {
        const { user, accessToken } = response.data;
        if (user.status === AccountStatus.PENDING_VERIFICATION) {
          navigate('OtpVerification', { email: user.email });
          return;
        }

        if (
          user.status === AccountStatus.PENDING_PROFILE ||
          !response.data.vendorProfile.isProfileComplete
        ) {
          navigate('CompleteProfile');
          return;
        }
        if (user.status === AccountStatus.PENDING_APPROVAL) {
          Alert.alert(
            'Pending Approval',
            'Your registration is complete. Please wait for admin review.'
          );
          return;
        }
        // setAuth(user, accessToken);@todo check token availb 
      }
    },
    onError: (err: any, values) => {
      console.log('Login Error Status:', err.statusCode);
      console.log('Login Error:', err);
      
      if (err.statusCode === 403) {
        navigate('OtpVerification', { email: values.email });
        return;
      }
      Alert.alert('Login Failed', err.error || 'Invalid email or password.');
    },
  });

  return {
    handleLogin: (values: any) => loginMutation.mutate(values),
    validate,
    isLoading: loginMutation.isPending,
    initialValues: { email: '', password: '' },
  };
};


