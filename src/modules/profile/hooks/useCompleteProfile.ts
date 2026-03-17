import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { profileService } from '../services/profileService';
import { useAuthStore } from '@store/useAuthStore';
import { ApiResponse } from '@/types/api';
import { useState } from 'react';

export const useCompleteProfile = (onSuccess?: () => void) => {
  const { user, updateUser } = useAuthStore();
  const [success, setSuccess] = useState(false);
  const completeProfileMutation = useMutation({
    mutationFn: (data: {
      profile: string;
      cnicFront: string;
      cnicBack: string;
      passport: string;
      cnicNumber: string;
    }): Promise<ApiResponse> => profileService.completeVendorProfile(data),
    onSuccess: (response) => {
      if (response.statusCode === 200 || response.statusCode === 201) {
        onSuccess?.();
        setSuccess(true)
      } else {
        Alert.alert('Submission Failed', response.message || 'Something went wrong.');
      }
    },
    onError: (err: any) => {
      console.log('Update Profile Error:', err);
      Alert.alert('Error', err.error || 'Failed to update profile. Please try again.');
    },
  });

  return {
    submitProfile: (data: {
      profile: string;
      cnicFront: string;
      cnicBack: string;
      passport: string;
      cnicNumber: string;
    }) => completeProfileMutation.mutate(data),
    isLoading: completeProfileMutation.isPending,
    success
  };
};
