!(function() {
  'use strict';
  const id = '1f564ab3894ede3a46f93d',
    files = [
      '/',
      '/assets/cricket.png',
      '/assets/scripts.js',
      '/assets/styles.css',
      '/index.html'
    ],
    cached = new Set(files);

  self.addEventListener('install', event => {
    event.waitUntil(
      caches
        .open(`carcricket-cache${id}`)
        .then(cache => cache.addAll(files))
        .then(() => {
          self.skipWaiting();
        })
    );
  }),
    self.addEventListener('activate', event => {
      event.waitUntil(
        caches.keys().then(async keys => {
          for (const key of keys)
            `carcricket-cache${id}` !== key && (await caches.delete(key));
          self.clients.claim();
        })
      );
    }),
    self.addEventListener('fetch', event => {
      if ('GET' !== event.request.method || event.request.headers.has('range'))
        return;
      const url = new URL(event.request.url);
      url.protocol.startsWith('http') &&
        ((url.hostname === self.location.hostname &&
          url.port !== self.location.port) ||
          (url.host === self.location.host && cached.has(url.pathname)
            ? event.respondWith(caches.match(event.request))
            : 'only-if-cached' !== event.request.cache &&
              event.respondWith(
                caches.open(`carcricket-offline${id}`).then(async cache => {
                  try {
                    const response = await fetch(event.request);
                    cache.put(event.request, response.clone());
                    return response;
                  } catch (err) {
                    const response = await cache.match(event.request);
                    if (response) return response;
                    throw err;
                  }
                })
              )));
    });
})();
