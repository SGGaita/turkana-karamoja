/* Push notification handlers — imported by the PWA service worker in production. */

/** A path on this site, or null (never an outside address). */
function sitePath(p) {
  return typeof p === 'string' && /^\/(?!\/)\S*$/.test(p) ? p : null;
}

self.addEventListener('push', (event) => {
  let data = { title: 'New climate alert', body: 'A new advisory has been published.', url: '/early-warnings' };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    /* use defaults */
  }

  // One notification per alert: a later notice for the same alert (an update or a cancellation) replaces it.
  // RED alerts stay on screen until the person acts on them.
  const options = {
    body: data.body,
    // Paths on this site sent by /api/push/broadcast (Site settings → Installed app), else the built-in icons.
    icon: sitePath(data.icon) || '/icons/icon-192.png',
    badge: sitePath(data.badge) || '/icons/badge-96.png',
    data: { url: data.url || '/early-warnings', alertId: data.alertId, state: data.state || 'active' },
    tag: data.tag || 'karamoja-alert',
    renotify: data.state !== 'cancelled',
    requireInteraction: data.requireInteraction === true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/early-warnings';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
      return undefined;
    })
  );
});
