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
      if (!response.data) return;
      
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
        setAuth(user, accessToken);
    },
    onError: (err: any, values) => {
      console.log('Login Error:', err);

      const status = err?.status;

      switch (status) {
        case 'pending_verification':
          // Email registered but not verified yet
          navigate('OtpVerification', { email: values.email });
          return;

        case 'pending_approval':
          // Profile complete, waiting for admin review
          Alert.alert(
            'Pending Approval',
            'Your vendor account is under review. You will be notified once approved.'
          );
          return;

        case 'suspended':
          Alert.alert(
            'Account Suspended',
            'Your account has been suspended. Please contact support for assistance.'
          );
          return;

        case 'banned':
          Alert.alert(
            'Account Banned',
            'Your account has been banned. Please contact support for more information.'
          );
          return;

        default:
          // Fallback for unknown errors
          Alert.alert('Login Failed', err?.error || 'Invalid email or password.');
      }
    },
  });

  return {
    handleLogin: (values: any) => loginMutation.mutate(values),
    validate,
    isLoading: loginMutation.isPending,
    initialValues: { email: '', password: '' },
  };
};


