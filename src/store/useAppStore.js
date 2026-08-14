import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),

  // Pins state
  pins: [],
  setPins: (pins) => set({ pins }),
  addPin: (pin) => set((state) => ({ pins: [...state.pins, pin] })),
  updatePin: (id, updatedPin) =>
    set((state) => ({
      pins: state.pins.map((p) => (p.id === id ? { ...p, ...updatedPin } : p)),
    })),
  deletePin: (id) =>
    set((state) => ({
      pins: state.pins.filter((p) => p.id !== id),
    })),

  // Pending pins (offline-created)
  pendingPins: [],
  addPendingPin: (pin) => set((state) => ({ pendingPins: [...state.pendingPins, pin] })),
  removePendingPin: (tempId) =>
    set((state) => ({
      pendingPins: state.pendingPins.filter((p) => p.tempId !== tempId),
    })),

  // Filters state
  filters: {
    type: [],
    severity: [],
    status: [],
  },
  setFilters: (filters) => set({ filters }),
  clearFilters: () =>
    set({
      filters: {
        type: [],
        severity: [],
        status: [],
      },
    }),

  // Sync status
  syncStatus: {
    isOnline: true,
    isSyncing: false,
    pendingCount: 0,
    conflictCount: 0,
    lastSyncTime: null,
  },
  setSyncStatus: (status) =>
    set((state) => ({
      syncStatus: { ...state.syncStatus, ...status },
    })),

  // Map viewport
  mapViewport: {
    center: [40.4168, -3.7038], // Default: Madrid
    zoom: 10,
  },
  setMapViewport: (viewport) =>
    set({
      mapViewport: viewport,
    }),

  // Language preference
  language: 'es',
  setLanguage: (lang) => set({ language: lang }),

  // Conflicts
  conflicts: [],
  addConflict: (conflict) =>
    set((state) => ({
      conflicts: [...state.conflicts, conflict],
      syncStatus: { ...state.syncStatus, conflictCount: state.conflicts.length + 1 },
    })),
  removeConflict: (conflictId) =>
    set((state) => ({
      conflicts: state.conflicts.filter((c) => c.id !== conflictId),
      syncStatus: {
        ...state.syncStatus,
        conflictCount: Math.max(0, state.conflicts.length - 1),
      },
    })),
  clearConflicts: () =>
    set({
      conflicts: [],
      syncStatus: { syncStatus: { conflicts: [], conflictCount: 0 } },
    }),
}));
