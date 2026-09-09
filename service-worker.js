const CACHE_NAME = 'reportflow-v3-20260909';

const CORE_SHELL = [
  './',
  './index.html',
  './site.webmanifest'
];

const OPTIONAL_ASSETS = [
  './favicon.ico',
  './apple-touch-icon.png',
  './icon-32x32.png',
  './icon-192x192.png',
  './icon-512x512.png',
  './maskable-icon-512x512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_SHELL);
    await Promise.allSettled(
      OPTIONAL_ASSETS.map(asset => cache.add(asset))
    );
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith('reportflow-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);

      if (
        response &&
        response.ok &&
        event.request.url.startsWith(self.location.origin)
      ) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, response.clone());
      }

      return response;
    } catch (error) {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      if (event.request.mode === 'navigate') {
        const fallback = await caches.match('./index.html');
        if (fallback) return fallback;
      }

      throw error;
    }
  })());
});
