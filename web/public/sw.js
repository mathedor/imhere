// Service Worker do I'm Here · Push Notifications + offline shell

const CACHE = "imhere-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
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
