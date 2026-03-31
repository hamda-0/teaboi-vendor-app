import { useQuery } from '@tanstack/react-query';
import { routeService, VendorRouteDetails } from '../services/routeService';

export const useVendorRoutes = (page = 1, limit = 10) => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: ['vendorRoutes', page, limit],
    queryFn: () => routeService.getAllRoutes(page, limit),
  });

  // Extracting routes based on possible API response structures
  const rawResponse = data?.data as {
    data?: VendorRouteDetails[];
    pagination?: { limit: number; page: number; total: number; totalPages: number };
    message?: string;
  } | undefined;
  
  const routes: VendorRouteDetails[] = Array.isArray(rawResponse?.data) ? rawResponse.data : [];
  const meta = rawResponse?.pagination || { total: 0 };

  return {
    routes,
    meta,
    isLoading,
    error,
    refetch,
    isRefetching,
  };
};
