import { useQuery } from '@tanstack/react-query';
import { orderService, Order } from '../services/orderService';

export const useActiveOrders = () => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: ['activeOrders'],
    queryFn: () => orderService.getActiveOrders(),
  });

  const rawResponse = data as any;
  
  // Extract orders based on confirmed API structure
  const orders: Order[] = Array.isArray(rawResponse?.data?.data) 
    ? rawResponse.data.data 
    : [];

  return {
    orders,
    isLoading,
    error,
    refetch,
    isRefetching,
  };
};
