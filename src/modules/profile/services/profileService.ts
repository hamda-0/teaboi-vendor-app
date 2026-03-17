import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiErrorResponse, ApiResponse } from '@/types/api';
import { User } from '@/types/auth';
import { isDev } from '@/utils/platform';

export const profileService = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiClient.get(ENDPOINTS.PROFILE.ME);
  },

  updateProfile: async (userData: Partial<User>): Promise< User | undefined> => {
    const response: ApiResponse<User> = await apiClient.patch(ENDPOINTS.PROFILE.UPDATE, userData);
    return response.data ;
  },

  uploadAvatar: async (imageUri: string): Promise<string> => {
    const formData = new FormData();
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    formData.append('file', {
      uri: imageUri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    } as any);
    const response: ApiResponse = await apiClient.post(ENDPOINTS.MEDIA.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  updateLocation: async (coords: { lat: number; lng: number }): Promise<void> => {
    isDev && console.log('locationCods', coords);
    const response:ApiResponse= await apiClient.patch(ENDPOINTS.PROFILE.LOCATION, coords);
    return response.data;
  },
  deleteAccount: async (): Promise<void> => {
      const response:ApiResponse=  await apiClient.delete(ENDPOINTS.PROFILE.DELETE);
      console.log(response.data, ">>>>>");
      return response.data;
  },

  completeVendorProfile: async (data: {
    profile: string;
    cnicFront: string;
    cnicBack: string;
    passport: string;
    cnicNumber: string;
  }): Promise<ApiResponse> => {
    const [profilePicResult, cnicFrontResult, cnicBackResult, passportResult]: any[] = await Promise.all([
      profileService.uploadAvatar(data.profile),
      profileService.uploadAvatar(data.cnicFront),
      profileService.uploadAvatar(data.cnicBack),
      profileService.uploadAvatar(data.passport),
    ]);

    const getUrl = (res: any) => (typeof res === 'string' ? res : res?.url);

    return await apiClient.patch(ENDPOINTS.PROFILE.COMPLETE_VENDOR_PROFILE, {
      profilePicUrl: getUrl(profilePicResult),
      cnicFrontUrl: getUrl(cnicFrontResult),
      cnicBackUrl: getUrl(cnicBackResult),
      passportUrl: getUrl(passportResult),
      cnicNumber: data.cnicNumber,
    });
  },
};
