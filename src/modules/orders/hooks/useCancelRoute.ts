import { useMutation, useQueryClient } from '@tanstack/react-query';
import { routeService } from '../services/routeService';
import { Alert } from 'react-native';

export const useCancelRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: routeService.cancelRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorRoutes'] });
      Alert.alert('Success', 'Route cancelled successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to cancel the route. Please try again.');
    },
  });
};
