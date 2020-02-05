!(function() {
  'use strict';
  const ID = 'carcricket-1f564xb3894ede3a46f94d',
    ROOT = '/car-cricket/',
    ERROR = 'error.html',
    AUTOCACHE = [
      ROOT,
      `${ROOT}assets/web-icon.png`,
      `${ROOT}assets/apple-icon.png`,
      `${ROOT}assets/scripts.js`,
      `${ROOT}assets/styles.css`,
      `${ROOT}index.html`
    ];

  self.addEventListener('install', event => {
    event.waitUntil(
      caches
        .open(ID)
        .then(cache => cache.addAll(AUTOCACHE))
        .then(() => {
          self.skipWaiting();
        })
    );
  });
  self.addEventListener('activate', event => {
    event.waitUntil(
      caches.keys().then(async keys => {
        for (const key of keys) ID !== key && (await caches.delete(key));
        self.clients.claim();
      })
    );
  });
  self.addEventListener('fetch', event => {
    if (
      !event.request.url.startsWith(self.location.origin) ||
      event.request.method !== 'GET'
    )
      return void event.respondWith(fetch(event.request));
    event.respondWith(
      caches.open(ID).then(async cache => {
        try {
          const response = await fetch(event.request);
          cache.put(event.request, response.clone());
          return response;
        } catch (err) {
          const response = await cache.match(event.request);
          if (response) return response;
          const error = await cache.match(new Request(ERROR));
          if (error) return error;
          throw err;
        }
      })
    );
  });
})();
