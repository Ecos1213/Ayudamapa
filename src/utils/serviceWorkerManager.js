/**
 * Service Worker Registration Utility
 * Handles registration, updates, and lifecycle
 */

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW Manager] Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('[SW Manager] Service Worker registered:', registration);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60000); // Check every minute

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available
          console.log('[SW Manager] Update available');
          notifyUpdateAvailable();
        }
      });
    });

    // Handle controller change (page refresh after update)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW Manager] Service Worker controller changed');
      notifyUpdateCompleted();
    });

    return registration;
  } catch (error) {
    console.error('[SW Manager] Registration failed:', error);
    return null;
  }
};

/**
 * Notify user that update is available
 */
const notifyUpdateAvailable = () => {
  // Post message to all clients
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'UPDATE_AVAILABLE',
    });
  }

  // Dispatch custom event for React components to listen to
  window.dispatchEvent(
    new CustomEvent('sw:update-available', {
      detail: { updateAvailable: true },
    })
  );
};

/**
 * Notify user that update is complete
 */
const notifyUpdateCompleted = () => {
  window.dispatchEvent(
    new CustomEvent('sw:update-completed', {
      detail: { updateCompleted: true },
    })
  );
};

/**
 * Force update check
 */
export const checkForUpdates = async () => {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      return registration;
    }
  } catch (error) {
    console.error('[SW Manager] Update check failed:', error);
  }

  return null;
};

/**
 * Clear all caches
 */
export const clearCaches = async () => {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheName.startsWith('ayudamapa-')) {
          return caches.delete(cacheName);
        }
      })
    );

    console.log('[SW Manager] Caches cleared');

    // Notify service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE',
      });
    }

    return true;
  } catch (error) {
    console.error('[SW Manager] Clear cache failed:', error);
    return false;
  }
};

/**
 * Unregister Service Worker (for cleanup)
 */
export const unregisterServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      console.log('[SW Manager] Unregistered:', success);
      return success;
    }
  } catch (error) {
    console.error('[SW Manager] Unregister failed:', error);
  }

  return false;
};

/**
 * Listen for update notifications
 */
export const onUpdateAvailable = (callback) => {
  window.addEventListener('sw:update-available', () => {
    callback();
  });
};

/**
 * Listen for update completion
 */
export const onUpdateCompleted = (callback) => {
  window.addEventListener('sw:update-completed', () => {
    callback();
  });
};
