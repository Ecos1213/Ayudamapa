/**
 * Sync Queue Service - Manage offline changes and sync operations
 */

import {
  getSyncQueue,
  addToSyncQueue,
  updateSyncQueueItem,
  removeFromSyncQueue,
  getPendingPins,
  addPendingPin,
  removePendingPin,
  cachePins,
  getCachedPins,
} from './indexeddb';
import { useAppStore } from '../store/useAppStore';
import { useConflicts } from '../utils/hooks';

/**
 * Generate temp UUID for offline-created items
 */
export const generateTempUUID = () => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Add pin creation to sync queue
 */
export const queuePinCreation = async (pinData) => {
  const tempId = generateTempUUID();
  const tempPin = {
    ...pinData,
    tempId,
    id: tempId,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  // Store in IndexedDB pending_pins
  await addPendingPin(tempPin);

  // Add to sync queue
  await addToSyncQueue({
    type: 'CREATE_PIN',
    data: tempPin,
    tempId,
    status: 'pending',
  });

  return tempPin;
};

/**
 * Add pin update to sync queue
 */
export const queuePinUpdate = async (pinId, updates) => {
  await addToSyncQueue({
    type: 'UPDATE_PIN',
    data: { id: pinId, ...updates },
    itemId: pinId,
    status: 'pending',
  });
};

/**
 * Add pin deletion to sync queue
 */
export const queuePinDeletion = async (pinId) => {
  await addToSyncQueue({
    type: 'DELETE_PIN',
    data: { id: pinId },
    itemId: pinId,
    status: 'pending',
  });
};

/**
 * Get all pending operations
 */
export const getPendingOperations = async () => {
  const queue = await getSyncQueue();
  return queue.filter((item) => item.status === 'pending');
};

/**
 * Get sync status summary
 */
export const getSyncStatusSummary = async () => {
  const queue = await getSyncQueue();
  const pendingPins = await getPendingPins();

  return {
    totalPending: queue.filter((item) => item.status === 'pending').length,
    totalFailed: queue.filter((item) => item.status === 'failed').length,
    pendingPins: pendingPins.length,
    queue,
  };
};

/**
 * Mark queue item as syncing
 */
export const markAsSync = async (queueId) => {
  await updateSyncQueueItem(queueId, {
    status: 'syncing',
    syncStartedAt: new Date().toISOString(),
  });
};

/**
 * Mark queue item as synced
 */
export const markAsSynced = async (queueId, serverData) => {
  await updateSyncQueueItem(queueId, {
    status: 'synced',
    syncedAt: new Date().toISOString(),
    serverData,
  });

  // Also remove from pending if it's a creation
  const item = await getQueueItem(queueId);
  if (item.type === 'CREATE_PIN' && item.tempId) {
    await removePendingPin(item.tempId);
  }
};

/**
 * Mark queue item as failed
 */
export const markAsFailed = async (queueId, error, retryCount) => {
  await updateSyncQueueItem(queueId, {
    status: 'failed',
    error: error?.message || 'Unknown error',
    failedAt: new Date().toISOString(),
    retryCount: retryCount || 0,
  });
};

/**
 * Retry failed sync item
 */
export const retryFailedSync = async (queueId) => {
  await updateSyncQueueItem(queueId, {
    status: 'pending',
    retryCount: (await getQueueItem(queueId)).retryCount + 1,
  });
};

/**
 * Get queue item by ID
 */
export const getQueueItem = async (queueId) => {
  const queue = await getSyncQueue();
  return queue.find((item) => item.id === queueId);
};

/**
 * Handle sync conflict - last-write-wins strategy
 */
export const resolveConflict = async (localData, serverData, conflictId) => {
  const { addConflict, removeConflict } = useConflicts();
  const localTime = new Date(localData.updatedAt).getTime();
  const serverTime = new Date(serverData.updatedAt).getTime();

  if (serverTime > localTime) {
    // Server version is newer - use server data
    useAppStore.getState().updatePin(serverData.id, serverData);
    removeConflict(conflictId);
    return { resolved: true, choice: 'server' };
  } else {
    // Local version is newer - keep local data
    removeConflict(conflictId);
    return { resolved: true, choice: 'local' };
  }
};

/**
 * Prepare sync payload for API
 */
export const prepareSyncPayload = async () => {
  const queue = await getSyncQueue();
  const pendingPins = await getPendingPins();

  const payload = {
    operations: queue
      .filter((item) => item.status === 'pending')
      .map((item) => ({
        id: item.id,
        type: item.type,
        data: item.data,
        tempId: item.tempId,
        timestamp: item.timestamp,
      })),
    pendingPins: pendingPins.map((pin) => ({
      ...pin,
      tempId: pin.tempId,
    })),
    lastSyncTime: localStorage.getItem('lastSyncTime') || new Date(0).toISOString(),
  };

  return payload;
};

/**
 * Process sync response and update IndexedDB
 */
export const processSyncResponse = async (response) => {
  const uuidMapping = response.uuidMapping || {}; // { tempId -> realId }
  const conflicts = response.conflicts || [];
  const store = useAppStore.getState();

  // Update pins with real UUIDs
  for (const [tempId, realId] of Object.entries(uuidMapping)) {
    const pendingPin = await getPendingPins().then((pins) =>
      pins.find((p) => p.tempId === tempId)
    );

    if (pendingPin) {
      // Replace temp pin with real pin from server
      const updatedPin = { ...pendingPin, id: realId };
      store.updatePin(tempId, updatedPin);
      await removePendingPin(tempId);
    }
  }

  // Handle conflicts
  if (conflicts.length > 0) {
    conflicts.forEach((conflict) => {
      store.addConflict({
        id: conflict.id,
        type: conflict.type,
        local: conflict.localData,
        server: conflict.serverData,
      });
    });
  }

  // Update last sync time
  localStorage.setItem('lastSyncTime', new Date().toISOString());

  return {
    success: true,
    uuidsMapped: Object.keys(uuidMapping).length,
    conflictsFound: conflicts.length,
  };
};

/**
 * Clear offline data (cache)
 */
export const clearOfflineData = async () => {
  await Promise.all([
    removePendingPin('*'),
    clearSyncQueue(),
    cachePins([]),
  ]).catch((e) => console.warn('Error clearing offline data:', e));
};
