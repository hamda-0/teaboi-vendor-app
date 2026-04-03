import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';

export const useOrderHistory = () => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: ['orderHistory'],
    queryFn: orderService.getOrderHistory,
  });

  const rawResponse = data as any;
  const orders = Array.isArray(rawResponse?.data) ? rawResponse.data : [];

  return {
    orders,
    isLoading,
    error,
    refetch,
    isRefetching,
  };
};
