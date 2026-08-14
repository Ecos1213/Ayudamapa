import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './apiClient';
import { usePins, usePendingPins } from './hooks';

/**
 * Fetch pins from server
 * GET /api/pins
 */
export const useGetPins = (filters = {}) => {
  return useQuery({
    queryKey: ['pins', filters],
    queryFn: async () => {
      const response = await apiClient.get('/api/pins', { params: filters });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Create a new pin
 * POST /api/pins
 */
export const useCreatePin = () => {
  const queryClient = useQueryClient();
  const { addPin } = usePins();
  const { addPendingPin } = usePendingPins();

  return useMutation({
    mutationFn: async (pinData) => {
      const response = await apiClient.post('/api/pins', pinData);
      return response.data;
    },
    onMutate: async (newPin) => {
      // Optimistic update - store temporary pin locally
      const tempId = `temp_${Date.now()}`;
      const tempPin = {
        ...newPin,
        tempId,
        id: tempId,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };

      // Add to pending pins
      addPendingPin(tempPin);

      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['pins'] });

      return { tempId };
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch pins
      queryClient.invalidateQueries({ queryKey: ['pins'] });
    },
    onError: (error, newPin, context) => {
      // Revert optimistic update on error
      console.error('Failed to create pin:', error);
      // Keep pending pin in local storage for retry
    },
  });
};

/**
 * Update an existing pin
 * PATCH /api/pins/:id
 */
export const useUpdatePin = () => {
  const queryClient = useQueryClient();
  const { updatePin } = usePins();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.patch(`/api/pins/${id}`, data);
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['pins'] });

      const previousPins = queryClient.getQueryData(['pins']);

      // Update cache optimistically
      queryClient.setQueryData(['pins'], (old) => {
        if (!old) return old;
        return old.map((pin) => (pin.id === id ? { ...pin, ...data } : pin));
      });

      return { previousPins };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pins'] });
    },
    onError: (error, variables, context) => {
      // Revert to previous data if mutation fails
      if (context?.previousPins) {
        queryClient.setQueryData(['pins'], context.previousPins);
      }
    },
  });
};

/**
 * Delete a pin
 * DELETE /api/pins/:id
 */
export const useDeletePin = () => {
  const queryClient = useQueryClient();
  const { deletePin } = usePins();

  return useMutation({
    mutationFn: async (id) => {
      await apiClient.delete(`/api/pins/${id}`);
      return id;
    },
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['pins'] });

      const previousPins = queryClient.getQueryData(['pins']);

      // Update cache optimistically
      queryClient.setQueryData(['pins'], (old) => {
        if (!old) return old;
        return old.filter((pin) => pin.id !== id);
      });

      return { previousPins };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pins'] });
    },
    onError: (error, variables, context) => {
      // Revert to previous data if mutation fails
      if (context?.previousPins) {
        queryClient.setQueryData(['pins'], context.previousPins);
      }
    },
  });
};

/**
 * Fetch pins nearby a location
 * GET /api/pins/nearby?lat=X&lng=Y&radius=5
 */
export const useNearbyPins = (lat, lng, radius = 5) => {
  return useQuery({
    queryKey: ['pins', 'nearby', { lat, lng, radius }],
    queryFn: async () => {
      const response = await apiClient.get('/api/pins/nearby', {
        params: { lat, lng, radius },
      });
      return response.data;
    },
    enabled: !!lat && !!lng,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Sync pins since last sync time
 * GET /api/sync?since=<lastSyncTime>
 */
export const useSyncPins = (lastSyncTime) => {
  return useQuery({
    queryKey: ['sync', { since: lastSyncTime }],
    queryFn: async () => {
      const response = await apiClient.get('/api/sync', {
        params: { since: lastSyncTime },
      });
      return response.data;
    },
    enabled: !!lastSyncTime,
    staleTime: 10 * 1000, // 10 seconds
  });
};

/**
 * Submit offline sync queue
 * POST /api/sync
 */
export const useSyncQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (syncData) => {
      const response = await apiClient.post('/api/sync', syncData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all pins and sync queries after successful sync
      queryClient.invalidateQueries({ queryKey: ['pins'] });
      queryClient.invalidateQueries({ queryKey: ['sync'] });
    },
  });
};
