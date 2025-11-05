// A simple cache-first service worker
const CACHE_NAME = 'tabriz-metro-v1';
const urlsToCache = [
    'index.html',
    'schedule.json',
    'httpsAF://cdn.tailwindcss.com',
    'httpsAF://v1.fontapi.ir/css/Vazirmatn'
];

// Install event: open cache and add app shell files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                // We use addAll(urlsToCache) but must handle potential failures,
                // especially with cross-origin requests like fonts and CDN.
                // For this simple case, we'll be optimistic.
                // A more robust implementation would fetch and cache individually.
                return cache.addAll(urlsToCache).catch(err => {
                    console.error('Failed to cache resources during install:', err);
                });
            })
    );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event: serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Not in cache - fetch from network
                return fetch(event.request).then(
                    response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            // Don't cache error responses or cross-origin scripts we don't control
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                ).catch(() => {
                    // Network request failed, and it's not in cache.
                    // This is where you might return a generic offline fallback page,
                    // but for this app, just failing the request is okay.
                });
            })
    );
});
