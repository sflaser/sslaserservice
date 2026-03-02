// Service Worker for Sky Fire Laser Website
// Version 1.2.0

const SW_VERSION = '1.2.0';
const STATIC_CACHE_NAME = `skyfire-static-v${SW_VERSION}`;
const DYNAMIC_CACHE_NAME = `skyfire-dynamic-v${SW_VERSION}`;

// Only cache specific same-origin paths as static assets.
const STATIC_PATHS = [
    '/',
    '/index.html',
    '/sslaserservice.html',
    '/admin.html',
    '/blog.html',
    '/sitemap.xml',
    '/manifest.json',
    '/robots.txt'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_PATHS);
            })
            .then(() => {
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Error caching static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    // Remove all old Sky Fire caches from previous versions.
                    if (
                        cache.startsWith('skyfire-') &&
                        cache !== STATIC_CACHE_NAME &&
                        cache !== DYNAMIC_CACHE_NAME
                    ) {
                        console.log('Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http requests
    if (!request.url.startsWith('http')) {
        return;
    }

    // Handle different types of requests
    if (isStaticAsset(request.url)) {
        // Static assets - cache first strategy
        event.respondWith(cacheFirstStrategy(request));
    } else if (isImageRequest(request)) {
        // Images - cache first with dynamic caching
        event.respondWith(cacheFirstWithDynamicCache(request));
    } else if (isHTMLRequest(request)) {
        // HTML - network first strategy
        event.respondWith(networkFirstStrategy(request));
    } else {
        // Other resources - network first
        event.respondWith(networkFirstStrategy(request));
    }
});

// Cache first strategy for static assets
async function cacheFirstStrategy(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        const cache = await caches.open(STATIC_CACHE_NAME);
        cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        return new Response('Offline', { status: 503 });
    }
}

// Cache first with dynamic cache for images
async function cacheFirstWithDynamicCache(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Image cache strategy failed:', error);
        // Return a fallback image or empty response
        return new Response('', { status: 503 });
    }
}

// Network first strategy for HTML and dynamic content
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok && request.url.includes('.html')) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Network first strategy failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('Offline', { 
            status: 503,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

// Helper functions
function isStaticAsset(url) {
    const parsed = new URL(url);
    if (parsed.origin !== self.location.origin) {
        return false;
    }
    return STATIC_PATHS.includes(parsed.pathname);
}

function isImageRequest(request) {
    return request.destination === 'image' || 
           request.url.includes('.jpg') || 
           request.url.includes('.jpeg') || 
           request.url.includes('.png') || 
           request.url.includes('.webp') || 
           request.url.includes('.avif');
}

function isHTMLRequest(request) {
    return request.destination === 'document' || 
           request.url.includes('.html');
}

// Background sync for analytics and form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'analytics-sync') {
        event.waitUntil(syncAnalytics());
    }
});

async function syncAnalytics() {
    // Sync any queued analytics data when online
    console.log('Syncing analytics data...');
}

// Push notifications (for future use)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icon-192.png',
            badge: '/badge-72.png'
        });
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});

// Performance monitoring
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        getCacheSize().then(size => {
            event.ports[0].postMessage({ cacheSize: size });
        });
    }
});

async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        totalSize += keys.length;
    }
    
    return totalSize;
} 
