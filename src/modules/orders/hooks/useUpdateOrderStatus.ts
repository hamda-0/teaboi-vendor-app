import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { Alert } from 'react-native';

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      orderService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeOrders'] });
      queryClient.invalidateQueries({ queryKey: ['orderHistory'] });
      queryClient.invalidateQueries({ queryKey: ['orderDetails'] });
      Alert.alert('Success', 'Order status updated successfully');
    },
    onError: (error: any) => {
      console.error('Update status failed', error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update order status');
    }
  });
};
