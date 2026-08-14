import { useAppStore } from '../store/useAppStore';

/**
 * Hook to get user state from Zustand store
 */
export const useUser = () => {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const clearUser = useAppStore((state) => state.clearUser);

  return { user, setUser, clearUser };
};

/**
 * Hook to get pins state from Zustand store
 */
export const usePins = () => {
  const pins = useAppStore((state) => state.pins);
  const setPins = useAppStore((state) => state.setPins);
  const addPin = useAppStore((state) => state.addPin);
  const updatePin = useAppStore((state) => state.updatePin);
  const deletePin = useAppStore((state) => state.deletePin);

  return { pins, setPins, addPin, updatePin, deletePin };
};

/**
 * Hook to get pending pins state from Zustand store
 */
export const usePendingPins = () => {
  const pendingPins = useAppStore((state) => state.pendingPins);
  const addPendingPin = useAppStore((state) => state.addPendingPin);
  const removePendingPin = useAppStore((state) => state.removePendingPin);

  return { pendingPins, addPendingPin, removePendingPin };
};

/**
 * Hook to get filters state from Zustand store
 */
export const useFilters = () => {
  const filters = useAppStore((state) => state.filters);
  const setFilters = useAppStore((state) => state.setFilters);
  const clearFilters = useAppStore((state) => state.clearFilters);

  return { filters, setFilters, clearFilters };
};

/**
 * Hook to get sync status from Zustand store
 */
export const useSyncStatus = () => {
  const syncStatus = useAppStore((state) => state.syncStatus);
  const setSyncStatus = useAppStore((state) => state.setSyncStatus);

  return { syncStatus, setSyncStatus };
};

/**
 * Hook to get map viewport from Zustand store
 */
export const useMapViewport = () => {
  const mapViewport = useAppStore((state) => state.mapViewport);
  const setMapViewport = useAppStore((state) => state.setMapViewport);

  return { mapViewport, setMapViewport };
};

/**
 * Hook to manage conflicts
 */
export const useConflicts = () => {
  const conflicts = useAppStore((state) => state.conflicts);
  const addConflict = useAppStore((state) => state.addConflict);
  const removeConflict = useAppStore((state) => state.removeConflict);
  const clearConflicts = useAppStore((state) => state.clearConflicts);

  return { conflicts, addConflict, removeConflict, clearConflicts };
};

/**
 * Hook to get language preference
 */
export const useLanguage = () => {
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);

  return { language, setLanguage };
};
