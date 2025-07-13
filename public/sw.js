const CACHE_NAME = "vaporwave-loyalty-v2";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/favicon.png",
  "/favicon.svg",
  "/src/App.css",
  "/src/index.css",
];

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log("All resources cached");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Cache failed:", error);
        return self.skipWaiting();
      })
  );
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker activated");
        return self.clients.claim();
      })
  );
});

// Fetch event with improved caching strategy
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip chrome-extension requests
  if (event.request.url.startsWith("chrome-extension://")) {
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response because it's a stream and can only be consumed once
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // Return a fallback page for navigation requests
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      })
  );
});

// Handle background sync (for future use)
self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);
});

// Handle push notifications (for future use)
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event);

  const options = {
    body: event.data
      ? event.data.text()
      : "New notification from Vaporwave Loyalty Club",
    icon: "/icon-192x192.png",
    badge: "/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Open App",
        icon: "/icon-96x96.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icon-96x96.png",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification("Vaporwave Loyalty Club", options)
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});
