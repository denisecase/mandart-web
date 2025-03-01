// service-worker.js - Simple cache service worker

// Cache version - update this when you release new versions
const CACHE_VERSION = '1.0.2';
const CACHE_NAME = `mandart-cache-${CACHE_VERSION}`;

// Determine base path based on hostname
const IS_GITHUB_PAGES = self.location.hostname.includes('github.io');
const BASE_PATH = IS_GITHUB_PAGES ? '/mandart-web/' : '/';

// List of core assets to cache
const CORE_ASSETS = [
  `${BASE_PATH}index.html`,
  `${BASE_PATH}index.js`,
  `${BASE_PATH}style.css`
];

// Install event - cache important assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching core assets');
        // Use addAll for the small list of core assets
        return cache.addAll(CORE_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('mandart-cache-') && 
                   cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first strategy for most resources
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests and non-GET requests
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache the response if successful
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(error => {
        // If network fetch fails, try to serve from cache
        console.log('Fetching from cache due to network error:', error);
        return caches.match(event.request);
      })
  );
});
