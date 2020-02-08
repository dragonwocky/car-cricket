!(function() {
  'use strict';
  const ID = 'carcricket@dragonwocky',
    ERROR = 'assets/error.html',
    AUTOCACHE = [
      ERROR,
      '.',
      'index.html',
      'assets/web-icon.png',
      'assets/apple-icon.png',
      'assets/styles.css',
      'assets/scripts.js',
      'assets/sear.0.5.3.min.js'
    ];

  /**
   * FOR CACHING EXTERNAL RESOURCES
   * - works, but not on initial load
   */

  // const EXTERNAL = [['external/sear.0.5.3.min.js', 'https://dragonwocky.me/sear/dist/sear.0.5.3.js']];
  //
  // in 'install':
  // for (let i = 0; i < EXTERNAL.length; i++) {
  //   const response = await fetch(EXTERNAL[i][1]);
  //   if (response.status === 200) cache.put(EXTERNAL[i][0], response.clone());
  // }
  //
  // in 'fetch':
  // for (let i = 0; i < EXTERNAL.length; i++)
  //   if (file[0] === new URL(event.request.url).pathname.slice(1)) {
  //     response = await fetch(EXTERNAL[i][1]);
  //     break;
  // }

  self.addEventListener('install', event => {
    event.waitUntil(
      caches
        .open(ID)
        .then(cache => cache.addAll(AUTOCACHE))
        .then(() => self.skipWaiting())
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
          let req = event.request,
            response = await fetch(event.request);
          if (response.status !== 200)
            (req = new Request(ERROR)), (response = await fetch(req));
          cache.put(req, response.clone());
          return response;
        } catch (err) {
          const response =
            (await cache.match(event.request)) || (await cache.match(new Request(ERROR)));
          if (response) return response;
          throw err;
        }
      })
    );
  });
})();
