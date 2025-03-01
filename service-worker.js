// service-worker.js - Place this file in your project root

// Cache version - update this when you release new versions
const CACHE_VERSION = '0.0.1';
const CACHE_NAME = `mandart-cache-${CACHE_VERSION}`;

// List of assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/mandart_wasm.js',
  '/mandart_wasm.wasm',
  '/src/ColorEditor.js',
  '/src/ColorEditorRow.js',
  '/src/fetch_catalog.js',
  '/src/globals.js',
  '/src/process_file.js',
  '/src/wasm_loader.js'
  // Add other important files as needed
];

// Install event - cache important assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete old version caches
            return cacheName.startsWith('mandart-cache-') && cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - use a "stale-while-revalidate" strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (new URL(event.request.url).origin !== location.origin) {
    return;
  }

  // Skip the request if it's not a GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Clone the request because it's a one-time use stream
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Update the cache with the new response
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((error) => {
          console.error('Fetch failed; returning offline page instead.', error);
          // No network available, fallback to cached page
          return cachedResponse;
        });

      // Return the cached response immediately, then update cache in background
      return cachedResponse || fetchPromise;
    })
  );
});