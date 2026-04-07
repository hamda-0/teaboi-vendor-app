import { useQuery } from '@tanstack/react-query';
import { menuService, Category, PaginatedCategories } from '../services/menuService';
import { ApiResponse } from '@/types/api';


export const useCategories = (page = 1, limit = 100) => {
  const {
    data,
    isLoading: isLoadingCats,
    error,
    refetch: refetchCats,
  } = useQuery({
    queryKey: ['categories', page, limit],
    queryFn: () => menuService.getCategories(page, limit),
    staleTime: 1000 * 60 * 60,
  });

  const rawResponse = data as unknown as ApiResponse<PaginatedCategories>;
  
  let categories: Category[] = [];
  
  if (Array.isArray(rawResponse?.data?.data)) {
    categories = rawResponse.data.data;
  } else if (Array.isArray(rawResponse?.data)) {
    const potentialData = rawResponse.data as any;
    if (Array.isArray(potentialData)) {
      categories = potentialData;
    }
  } else if (Array.isArray(rawResponse)) {
    categories = rawResponse as unknown as Category[];
  }

  return {
    categories,
    isLoadingCats,
    error,
    refetchCats,
  };
};
