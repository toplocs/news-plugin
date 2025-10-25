/**
 * Service Worker for TopLocs News Plugin
 * Provides offline support and caching
 */

const CACHE_VERSION = 'v1'
const CACHE_NAME = `toplocs-news-${CACHE_VERSION}`

// Files to cache immediately
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/demo-3col.html',
  '/solid-dashboard.html',
  '/offline.html'
]

// Cache strategies
const CACHE_STRATEGIES = {
  // Network first, fallback to cache
  networkFirst: [
    /\/api\//,
    /\.json$/
  ],
  // Cache first, fallback to network
  cacheFirst: [
    /\.css$/,
    /\.js$/,
    /\.woff2?$/,
    /\.png$/,
    /\.jpg$/,
    /\.svg$/
  ],
  // Stale while revalidate
  staleWhileRevalidate: [
    /\.html$/
  ]
}

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching resources')
        return cache.addAll(PRECACHE_URLS)
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Precaching failed:', error)
      })
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return
  }

  // Determine strategy
  const strategy = getStrategy(url.pathname)

  event.respondWith(
    handleRequest(request, strategy)
  )
})

// Get caching strategy for URL
function getStrategy(pathname) {
  for (const [strategy, patterns] of Object.entries(CACHE_STRATEGIES)) {
    if (patterns.some(pattern => pattern.test(pathname))) {
      return strategy
    }
  }
  return 'networkFirst' // Default
}

// Handle request with strategy
async function handleRequest(request, strategy) {
  switch (strategy) {
    case 'cacheFirst':
      return cacheFirst(request)
    case 'networkFirst':
      return networkFirst(request)
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request)
    default:
      return networkFirst(request)
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.error('[SW] Fetch failed:', error)
    return new Response('Offline', { status: 503 })
  }
}

// Network first strategy
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.error('[SW] Network failed, trying cache:', error)
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return cache.match('/offline.html')
    }
    return new Response('Offline', { status: 503 })
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => cached)

  return cached || fetchPromise
}

// Message handler for manual cache updates
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME)
        .then(() => {
          event.ports[0].postMessage({ success: true })
        })
    )
  }
})

console.log('[SW] Service Worker loaded')
