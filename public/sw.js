// Update the service worker to handle notifications

// This is a simple service worker for the PWA
self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request)
    }),
  )
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes("/workout") && "focus" in client) return client.focus()
        }
        if (clients.openWindow) return clients.openWindow("/workout")
      }),
  )
})
