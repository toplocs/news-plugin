// Service Worker für TopLocs News Plugin
// Version 2.0.0

const CACHE_NAME = 'toplocs-news-v2.0.0'
const RUNTIME_CACHE = 'toplocs-news-runtime'

// Files to cache immediately
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
]

// Install event - precache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching static assets')
        return cache.addAll(PRECACHE_URLS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // Skip Gun.js Gun sync requests (always use network)
  if (url.pathname.includes('/gun')) {
    return
  }

  // Handle different request types
  if (request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', url.pathname)
          return cachedResponse
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response
            }

            // Clone response (can only be consumed once)
            const responseToCache = response.clone()

            // Cache dynamic content
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                console.log('[SW] Caching new resource:', url.pathname)
                cache.put(request, responseToCache)
              })

            return response
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error)
            
            // Return offline page if available
            return caches.match('/offline.html')
              .then((fallback) => fallback || new Response('Offline - bitte Internetverbindung prüfen'))
          })
      })
  )
})

// Message event - handle messages from app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested')
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing all caches')
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => Promise.all(cacheNames.map((name) => caches.delete(name))))
    )
  }
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    console.log('[SW] Background sync: messages')
    event.waitUntil(syncMessages())
  }
})

// Push notification handling
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'TopLocs News'
  const options = {
    body: data.body || 'Neue Benachrichtigung',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    data: data
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  )
})

// Helper functions
async function syncMessages() {
  // Sync pending messages when back online
  try {
    const cache = await caches.open(RUNTIME_CACHE)
    const cachedRequests = await cache.keys()
    
    // Process pending message sends
    for (const request of cachedRequests) {
      if (request.url.includes('/messages/send')) {
        await fetch(request)
        await cache.delete(request)
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error)
  }
}

console.log('[SW] Service Worker loaded')
