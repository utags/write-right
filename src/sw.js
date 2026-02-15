const APP_CACHE_NAME = 'write-right-v1770604069345'
const DATA_CACHE_NAME = 'hanzi-data-cache-v1'
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './dist/main.js',
  './manifest.json',
]

self.addEventListener('install', (event) => {
  // Force waiting service worker to become active
  self.skipWaiting()

  event.waitUntil(
    caches.open(APP_CACHE_NAME).then((cache) => {
      console.log('Opened app cache')
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener('activate', (event) => {
  // Claim clients immediately so the new service worker takes control
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Only delete old App Shell caches (starting with 'write-right-')
            // Preserve Data Cache ('hanzi-data-cache-v1')
            if (
              cacheName.startsWith('write-right-') &&
              cacheName !== APP_CACHE_NAME
            ) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
    ])
  )
})

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url)

  // 1. Hanzi Data Strategy: Cache First (Stale-While-Revalidate could be used, but data is mostly immutable)
  // Data files are in /data/ directory
  if (requestUrl.pathname.includes('/data/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            return response // Hit
          }
          // Miss -> Network -> Cache
          return fetch(event.request).then((networkResponse) => {
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type !== 'basic'
            ) {
              return networkResponse
            }
            cache.put(event.request, networkResponse.clone())
            return networkResponse
          })
        })
      })
    )
    return
  }

  // 2. App Shell Strategy: Stale-While-Revalidate
  // Return cached response immediately when available, and update cache in background.
  event.respondWith(
    caches.open(APP_CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type !== 'basic'
            ) {
              return networkResponse
            }
            cache.put(event.request, networkResponse.clone())
            return networkResponse
          })
          .catch(() => cachedResponse)

        return cachedResponse || fetchPromise
      })
    })
  )
})
