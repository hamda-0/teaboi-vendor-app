import { useMutation, useQueryClient } from '@tanstack/react-query';
import { routeService, CreateRouteRequest } from '../services/routeService';
import { Alert } from 'react-native';

export const useUpdateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRouteRequest> }) => 
      routeService.updateRoute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorRoutes'] });
      Alert.alert('Success', 'Route updated successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to update the route. Please try again.');
    },
  });
};
