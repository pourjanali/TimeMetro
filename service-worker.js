// A simple, offline-first service worker

const CACHE_NAME = 'tabriz-metro-v2'; // Incremented version
const assetsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    'https://cdn.tailwindcss.com', // Cache Tailwind
    'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700&display=swap', // Cache font
    // Note: Add icon paths if you have them, e.g., '/icons/icon-192x192.png'
];

// Event: install
// Caches the core application assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(assetsToCache);
            })
            .catch(error => {
                console.error('Service Worker: Failed to cache app shell:', error);
            })
    );
});

// Event: activate
// Cleans up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Event: fetch
// Implements a "Cache falling back to Network" strategy
self.addEventListener('fetch', event => {
    // We only want to cache GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // 1. Try to get from cache
                if (cachedResponse) {
                    // Cache hit - return response
                    return cachedResponse;
                }

                // 2. Not in cache - go to network
                return fetch(event.request)
                    .then(networkResponse => {
                        // 3. (Optional) Cache the new response
                        // Check if we received a valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(error => {
                        // Network request failed (e.g., offline)
                        console.log('Service Worker: Fetch failed; returning offline page or error.', error);
                        // Here you could return an offline fallback page if you had one
                    });
            })
    );
});