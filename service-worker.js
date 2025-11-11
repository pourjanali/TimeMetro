// Enhanced service worker with update notifications
const CACHE_NAME = 'tabriz-metro-v2.1.0';
const APP_SHELL_CACHE = 'tabriz-metro-shell-v1';

const assetsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    '/privacy.html',
    '/terms.html',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700&display=swap',
    'https://img.icons8.com/fluency/96/000000/subway.png'
];

// Install event - cache app shell
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');

    event.waitUntil(
        caches.open(APP_SHELL_CACHE)
            .then(cache => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(assetsToCache);
            })
            .then(() => {
                console.log('Service Worker: Install completed');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Failed to cache app shell:', error);
            })
    );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== APP_SHELL_CACHE) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activate completed');
            return self.clients.claim();
        })
    );
});

// Fetch event - cache first, then network strategy
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached version if available
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Otherwise go to network
                return fetch(event.request)
                    .then(networkResponse => {
                        // Check if valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Clone and cache the response
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // Network failed - you could return a custom offline page here
                        console.log('Service Worker: Network request failed');
                    });
            })
    );
});

// Listen for messages from the app
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Check for updates periodically
self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-check') {
        event.waitUntil(checkForUpdates());
    }
});

async function checkForUpdates() {
    try {
        const response = await fetch('/');
        if (!response.ok) throw new Error('Network response was not ok');

        const client = await self.clients.matchAll();
        if (client && client.length) {
            client[0].postMessage({
                type: 'UPDATE_AVAILABLE',
                message: 'بروزرسانی جدید موجود است'
            });
        }
    } catch (error) {
        console.log('Update check failed:', error);
    }
}