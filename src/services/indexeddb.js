/**
 * IndexedDB Service - Manage offline storage and caching
 * Database: "ayudamapa_db"
 * Object Stores: pins, pending_pins, supply_requests, volunteer_assignments, sync_queue, user_profile
 */

const DB_NAME = 'ayudamapa_db';
const DB_VERSION = 1;

let dbInstance = null;

/**
 * Initialize IndexedDB database
 */
export const initializeDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error}`));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('pins')) {
        db.createObjectStore('pins', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('pending_pins')) {
        db.createObjectStore('pending_pins', { keyPath: 'tempId' });
      }

      if (!db.objectStoreNames.contains('supply_requests')) {
        db.createObjectStore('supply_requests', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('volunteer_assignments')) {
        db.createObjectStore('volunteer_assignments', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('user_profile')) {
        db.createObjectStore('user_profile', { keyPath: 'userId' });
      }
    };
  });
};

/**
 * Get database instance
 */
const getDB = async () => {
  if (dbInstance) return dbInstance;
  return await initializeDB();
};

/**
 * Add or update item in object store
 */
export const setItem = async (storeName, data) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

/**
 * Get item from object store
 */
export const getItem = async (storeName, key) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

/**
 * Delete item from object store
 */
export const deleteItem = async (storeName, key) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

/**
 * Get all items from object store
 */
export const getAllItems = async (storeName) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
};

/**
 * Clear all items from object store
 */
export const clearStore = async (storeName) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

/**
 * Count items in object store
 */
export const countItems = async (storeName) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.count();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

/**
 * Cache pins after fetching from API
 */
export const cachePins = async (pins) => {
  const db = await getDB();
  const transaction = db.transaction(['pins'], 'readwrite');
  const store = transaction.objectStore('pins');

  // Clear existing pins and add new ones
  await clearStore('pins');

  return new Promise((resolve, reject) => {
    pins.forEach((pin) => {
      store.put(pin);
    });

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
};

/**
 * Get cached pins
 */
export const getCachedPins = async () => {
  return await getAllItems('pins');
};

/**
 * Add pending pin (offline created)
 */
export const addPendingPin = async (pin) => {
  const tempPin = {
    ...pin,
    tempId: `temp_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  await setItem('pending_pins', tempPin);
  return tempPin;
};

/**
 * Get pending pins
 */
export const getPendingPins = async () => {
  return await getAllItems('pending_pins');
};

/**
 * Remove pending pin after sync
 */
export const removePendingPin = async (tempId) => {
  await deleteItem('pending_pins', tempId);
};

/**
 * Add to sync queue
 */
export const addToSyncQueue = async (action) => {
  const queueItem = {
    ...action,
    timestamp: new Date().toISOString(),
    status: 'pending', // pending, syncing, synced, failed
    retryCount: 0,
  };

  return await setItem('sync_queue', queueItem);
};

/**
 * Get sync queue
 */
export const getSyncQueue = async () => {
  return await getAllItems('sync_queue');
};

/**
 * Update sync queue item status
 */
export const updateSyncQueueItem = async (id, updates) => {
  const item = await getItem('sync_queue', id);
  if (item) {
    await setItem('sync_queue', { ...item, ...updates });
  }
};

/**
 * Remove from sync queue
 */
export const removeFromSyncQueue = async (id) => {
  await deleteItem('sync_queue', id);
};

/**
 * Clear sync queue
 */
export const clearSyncQueue = async () => {
  await clearStore('sync_queue');
};

/**
 * Store user profile
 */
export const setUserProfile = async (userId, profile) => {
  await setItem('user_profile', { userId, ...profile });
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  return await getItem('user_profile', userId);
};

/**
 * Close database connection
 */
export const closeDB = () => {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
};
