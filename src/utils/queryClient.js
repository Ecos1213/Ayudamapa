import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes - keep data fresh but avoid excessive refetches
      staleTime: 5 * 60 * 1000,
      // 10 minutes - cache duration before garbage collection
      gcTime: 10 * 60 * 1000,
      // Retry failed requests
      retry: 2,
      // Exponential backoff: 1s, 2s, 4s...
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus to stay fresh
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
