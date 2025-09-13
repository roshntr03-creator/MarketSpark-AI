/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const CACHE_NAME = 'marketspark-ai-cache-v1';
// This list should be updated with all the core files needed for the app shell to work
const urlsToCache = [
  '/',
  '/index.html',
  // Since we are using ESM imports from a CDN, we can't cache them directly in this simple setup.
  // A more advanced setup would use a build tool to bundle dependencies.
  // For now, we cache the local files.
  '/index.tsx', // This might not be directly fetchable depending on the server setup, but for the sake of example.
];

// Install a service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // For requests to CDNs or external resources, just fetch from the network.
  if (event.request.url.startsWith('https://esm.sh/') || event.request.url.startsWith('https://fonts.googleapis.com/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
