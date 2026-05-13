// Service Worker do I'm Here · Push Notifications + offline shell

const CACHE = "imhere-v2";
const PRECACHE = ["/", "/app", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => null))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      ),
    ])
  );
});

// Network-first pra navegação (HTML), cache-first pra estáticos
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (!request.url.startsWith(self.location.origin)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => null);
          return res;
        })
        .catch(() => caches.match(request).then((r) => r ?? caches.match("/")))
    );
    return;
  }

  if (/\.(?:png|jpg|jpeg|svg|webp|ico|woff2?|css|js)$/.test(request.url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => null);
          return res;
        });
      })
    );
  }
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "I'm Here",
    body: "Você tem uma nova notificação",
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    url: "/app/notificacoes",
  };

  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch (e) {
    // payload não é JSON; usa default
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      tag: payload.tag ?? "imhere",
      vibrate: [120, 60, 120],
      data: { url: payload.url ?? "/app" },
      actions: payload.actions ?? [],
      requireInteraction: false,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Foca em janela existente se já está no app
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Senão, abre nova
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
