import { QueryClient } from '@tanstack/react-query';

const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: 1,
  refetchOnWindowFocus: false,
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: defaultQueryOptions,
    mutations: {
      retry: 0,
    },
  },
});

