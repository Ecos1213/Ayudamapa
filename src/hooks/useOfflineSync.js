import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useSyncStatus } from '../utils/hooks';
import {
  cachePins,
  getCachedPins,
  initializeDB,
} from '../services/indexeddb';
import {
  prepareSyncPayload,
  processSyncResponse,
  getPendingOperations,
} from '../services/syncQueue';
import { useSyncQueue } from '../utils/queryHooks';
import apiClient from '../utils/apiClient';

/**
 * Custom hook for managing offline sync
 * Coordinates between IndexedDB, sync queue, and backend API
 */
export const useOfflineSync = () => {
  const { pins, setPins } = useAppStore();
  const { setSyncStatus } = useSyncStatus();
  const syncQueueMutation = useSyncQueue();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize offline storage
  useEffect(() => {
    const init = async () => {
      try {
        // Initialize IndexedDB
        await initializeDB();

        // Load cached pins
        const cachedPins = await getCachedPins();
        if (cachedPins.length > 0) {
          setPins(cachedPins);
        }

        // Check online status
        updateOnlineStatus();

        // Listen for online/offline events
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        setIsInitialized(true);
      } catch (error) {
        console.error('[useOfflineSync] Initialization error:', error);
      }
    };

    init();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setPins]);

  // Perform sync when going online
  const performSync = async () => {
    if (!isInitialized) return;

    setSyncStatus({ isSyncing: true });

    try {
      // Get pending operations
      const pending = await getPendingOperations();

      if (pending.length === 0) {
        setSyncStatus({ isSyncing: false, isOnline: true });
        return;
      }

      // Prepare sync payload
      const payload = await prepareSyncPayload();

      // Send to backend
      const response = await apiClient.post('/api/sync', payload);

      // Process response
      await processSyncResponse(response.data);

      // Update sync status
      setSyncStatus({
        isSyncing: false,
        isOnline: true,
        pendingCount: 0,
        lastSyncTime: new Date().toISOString(),
      });

      // Refetch pins to get latest data
      const latestPins = await apiClient.get('/api/pins');
      setPins(latestPins.data);
      await cachePins(latestPins.data);
    } catch (error) {
      console.error('[useOfflineSync] Sync error:', error);
      setSyncStatus({ isSyncing: false, isOnline: navigator.onLine });
    }
  };

  // Update online status
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;
    setSyncStatus({ isOnline });

    if (isOnline && (performance.now() - lastSyncTime > 10000)) {
      // Sync if online and last sync was more than 10 seconds ago
      performSync();
    }
  };

  // Handle online event
  const handleOnline = () => {
    console.log('[useOfflineSync] Online');
    setSyncStatus({ isOnline: true });
    performSync();
  };

  // Handle offline event
  const handleOffline = () => {
    console.log('[useOfflineSync] Offline');
    setSyncStatus({ isOnline: false });
  };

  // Auto-sync every 10 seconds when online
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      if (navigator.onLine) {
        performSync();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isInitialized]);

  return {
    isInitialized,
    performSync,
    isOnline: navigator.onLine,
  };
};

let lastSyncTime = 0;
