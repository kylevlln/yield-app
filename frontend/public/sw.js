/// <reference types="service-worker" />

const CACHE_NAME = 'yield-v3'
const OFFLINE_URL = '/offline.html'
const STATIC_ASSETS = [
  '/',
  '/generate',
  '/pantry',
  '/history',
  '/faq',
  '/manifest.json',
  '/offline.html',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip cross-origin requests (Supabase, API, Sentry, etc.)
  if (url.origin !== location.origin) return

  // Next.js hashed chunks (_next/static/) — cache-first, never stale
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request))
    return
  }

  // API routes — network first, fall back to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request))
    return
  }

  // Static assets (images, fonts, etc.) — cache first
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|webp|avif)$/)) {
    event.respondWith(cacheFirst(request))
    return
  }

  // HTML pages — stale while revalidate (serve fast, update in background)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  // Default — network first
  event.respondWith(networkFirst(request))
})

function offlineFallback() {
  return caches.match(OFFLINE_URL).then((response) => {
    return response || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/html' } })
  })
}

async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

async function networkFirst(request: Request): Promise<Response> {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    // Serve offline page for navigation requests
    if (request.mode === 'navigate') return offlineFallback()
    return new Response('Offline', { status: 503 })
  }
}

async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cached = await caches.match(request)

  const fetchPromise = fetch(request).then(async (response) => {
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, response.clone())
    }
    return response
  }).catch(() => {
    if (cached) return cached
    // Serve offline page for navigation requests
    if (request.mode === 'navigate') return offlineFallback()
    return new Response('Offline', { status: 503 })
  })

  // Return cached immediately if available, otherwise wait for network
  return cached || fetchPromise
}
