!(function() {
  'use strict';
  const ID = 'carcricket@dragonwocky',
    ERROR = '/assets/error.html',
    AUTOCACHE = [
      ERROR,
      '/',
      '/index.html',
      '/assets/web-icon.png',
      '/assets/apple-icon.png',
      '/assets/scripts.js',
      '/assets/styles.css'
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
