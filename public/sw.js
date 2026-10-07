// This static service worker displays notifications. It does not schedule timers.
self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const scope = new URL(self.registration.scope);
    let target = scope;
    try {
      const requested = new URL(event.notification.data?.url || './', scope);
      if (requested.origin === scope.origin && requested.pathname.startsWith(scope.pathname)) target = requested;
    } catch { /* A notification with an invalid URL opens the timer home. */ }
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = windows.find((client) => {
      const url = new URL(client.url);
      return url.origin === target.origin && url.pathname === target.pathname;
    });
    if (existing) return existing.focus();
    return self.clients.openWindow(target.href);
  })());
});
