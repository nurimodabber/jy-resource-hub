/* Offline support: cache pages and assets as they are used or bookmarked, serve them when the network is gone. */
const CACHE = 'jy-hub-v3';
const CORE_URLS = ['/', '/index.html', '/games', '/quotes', '/service-arts', '/treffen', '/saved', '/tools'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(CORE_URLS).catch(() => c.add('/')))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (e) => {
  const data = e.data;
  if (data && data.type === 'CACHE_URLS' && Array.isArray(data.urls)) {
    e.waitUntil(
      caches.open(CACHE).then(async (cache) => {
        for (const rawUrl of data.urls) {
          try {
            const url = new URL(rawUrl, self.location.origin);
            if (url.origin === self.location.origin && !url.pathname.startsWith('/api/')) {
              const res = await fetch(url.pathname, { credentials: 'same-origin' });
              if (res.ok) {
                await cache.put(url.pathname, res.clone());
              }
            }
          } catch {
            /* ignore network errors while offline */
          }
        }
      }),
    );
  }
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Never cache or intercept API endpoints or non-GET requests
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(url.pathname, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(url.pathname)
            .then((hit) => hit || caches.match(req))
            .then((hit) => hit || caches.match('/'))
            .then((hit) => hit || caches.match('/index.html')),
        ),
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || net;
    }),
  );
});
