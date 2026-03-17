import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { useAuthStore } from '@store/useAuthStore';
import { User } from '@/types/auth';
import { goBack } from '@/navigation/navigationRef';
import { useFormValidation } from '@/shared/hooks/useFormValidation';
import { profileSchema } from '@/utils/schemas';

export const useEditProfile = () => {
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState<Partial<User>>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [avatar, setAvatar] = useState<string | null>(null);

  const { 
    data: profile, 
    isLoading: fetching,
    error: fetchError 
  } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
    staleTime: 0,
  });

  useEffect(() => {
    if (profile?.data) {
      setProfileData({
        name: profile.data.name || '',
        email: profile.data.email || '',
        phone: profile.data.phone || '',
      });
      setAvatar(profile.data.profilePicUrl || null);
      updateUser(profile.data);
    }
  }, [profile, updateUser]);

  useEffect(() => {
    if (fetchError && !user) {
      Alert.alert('Error', (fetchError as any).message || 'Failed to fetch profile');
    }
  }, [fetchError,user]);

  const handleInputChange = (field: keyof User, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const updateMutation = useMutation({
    mutationFn: async (values: Partial<User>) => {
      let profilePicUrl = avatar;
      
      if (avatar?.startsWith('file://') || avatar?.startsWith('content://')) {
        try {          
          profilePicUrl = await profileService.uploadAvatar(avatar);

        } catch (error) {
          console.error('Avatar upload failed:', error);
          Alert.alert('Warning', 'Image upload failed. Updating profile text only.');
        }
      }   

      return profileService.updateProfile({
        name: values.name || '',
        phone: values.phone || '',
        profilePicUrl: profilePicUrl || null
      });
    },
    onSuccess: (updatedUser) => {
      if (updatedUser) {
        updateUser(updatedUser);
      }
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => goBack() }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to update profile');
    },
  });

  const { validate } = useFormValidation(profileSchema);
  return {
    profileData,
    loading: updateMutation.isPending,
    fetching,
    avatar,
    setAvatar,
    handleInputChange,
    validate,
    handleSave: (values: Partial<User>) => updateMutation.mutate(values),
    user
  };
};
