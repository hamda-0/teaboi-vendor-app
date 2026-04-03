import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService, MenuItem, PaginatedMenu } from '../services/menuService';
import { ApiResponse } from '@/types/api';
import { Alert } from 'react-native';

export const useVendorMenu = (page = 1, limit = 50) => {
  const queryClient = useQueryClient();

  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: ['vendorMenu', page, limit],
    queryFn: () => menuService.getVendorMenu(page, limit),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => menuService.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorMenu'] });
      Alert.alert('Success', 'Menu item deleted');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => menuService.toggleMenuItemStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorMenu'] });
    }
  });

  const rawResponse = data as unknown as ApiResponse<PaginatedMenu>;
  
  // Extract items based on confirmed API structure
  const menuItems: MenuItem[] = Array.isArray(rawResponse?.data?.data) 
    ? rawResponse.data.data 
    : [];

  return {
    menuItems,
    isLoading,
    error,
    refetch,
    isRefetching,
    deleteItem: deleteMutation.mutateAsync,
    toggleItem: toggleMutation.mutateAsync,
  };
};
