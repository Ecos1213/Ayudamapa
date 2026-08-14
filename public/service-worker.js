/**
 * Service Worker
 * Handles offline caching, offline fallback, and asset updates
 */

const CACHE_VERSION = 1;
const CACHE_NAME = `ayudamapa-static-v${CACHE_VERSION}`;
const OFFLINE_PAGE = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // Force new service worker to activate immediately
  self.skipWaiting();
});

/**
 * Activate event - clean up old cache versions
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME && cacheName.startsWith('ayudamapa-')) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Claim all clients
  self.clients.claim();
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Determine caching strategy based on resource type
  if (isStaticAsset(url.pathname)) {
    // Cache-first strategy for static assets (JS, CSS, images, fonts)
    event.respondWith(cacheFirst(request));
  } else if (isApiRequest(url.pathname)) {
    // Network-first strategy for API requests with fallback
    event.respondWith(networkFirstWithCache(request));
  } else {
    // Network-first strategy for HTML and other resources
    event.respondWith(networkFirstWithOfflineFallback(request));
  }
});

/**
 * Cache-first strategy: try cache, fallback to network
 */
async function cacheFirst(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
      console.log('[Service Worker] Cache hit:', request.url);
      return cached;
    }

    // Not in cache, fetch from network
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[Service Worker] Cache-first error:', error);
    throw error;
  }
}

/**
 * Network-first strategy: try network, fallback to cache
 */
async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request);

    // Cache successful API responses
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);

    try {
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }
    } catch (cacheError) {
      console.error('[Service Worker] Cache lookup failed:', cacheError);
    }

    // No cache available, return offline response
    return new Response('{"error":"offline"}', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }
}

/**
 * Network-first strategy with offline fallback page
 */
async function networkFirstWithOfflineFallback(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.log('[Service Worker] Network failed, returning offline fallback');

    // Try to return offline page from cache
    const cache = await caches.open(CACHE_NAME);
    return cache.match(OFFLINE_PAGE) || new Response('Offline', { status: 503 });
  }
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(pathname) {
  return (
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.ttf') ||
    pathname.endsWith('.eot')
  );
}

/**
 * Check if URL is an API request
 */
function isApiRequest(pathname) {
  return pathname.startsWith('/api/');
}

/**
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[Service Worker] Clearing cache');
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});
