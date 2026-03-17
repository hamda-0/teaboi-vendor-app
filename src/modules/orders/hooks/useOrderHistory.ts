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

  return {
    orders: data?.data || [],
    isLoading,
    error,
    refetch,
    isRefetching,
  };
};
