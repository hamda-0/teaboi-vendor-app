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

  const rawResponse = data as any;
  
  let routes: VendorRouteDetails[] = [];
  if (Array.isArray(rawResponse?.data)) {
    routes = rawResponse.data;
  } else if (Array.isArray(rawResponse?.data?.data)) {
    routes = rawResponse.data.data;
  } else if (Array.isArray(rawResponse)) {
    routes = rawResponse;
  }
  
  const meta = rawResponse?.pagination || rawResponse?.data?.pagination || { total: routes.length };

  return {
    routes,
    meta,
    isLoading,
    error,
    refetch,
    isRefetching,
  };
};
