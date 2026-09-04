const CACHE_NAME = 'bhio-v3';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.svg', '/icons/icon-512.svg'];

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);

  // Always fetch Supabase configuration and SDK code so stale cached assets
  // cannot make the client appear disconnected after a deployment.
  if (
    requestUrl.pathname === '/supabase-config.js' ||
    requestUrl.hostname === 'cdn.jsdelivr.net' && requestUrl.pathname.includes('/@supabase/supabase-js')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network-first for navigation and config files so updates are immediately visible
  if (event.request.mode === 'navigate' || requestUrl.pathname === '/supabase-config.js') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  // Network first fallback to cache for other assets
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});