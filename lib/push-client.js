export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function isPushSupported() {
  return typeof window !== 'undefined'
    && window.isSecureContext
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window;
}

export function getNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/**
 * Must run immediately on user click — before any other async work — or Chrome
 * may reject the prompt for lack of a user gesture.
 */
export async function requestNotificationPermission() {
  const current = getNotificationPermission();
  if (current === 'granted') return 'granted';
  if (current === 'denied') return 'denied';
  return Notification.requestPermission();
}

export async function getPushRegistration() {
  if (!isPushSupported()) return null;

  const swPath = process.env.NODE_ENV === 'development' ? '/sw-dev.js' : '/sw.js';
  let reg = await navigator.serviceWorker.getRegistration();

  // Dev: replace a stale production service worker so push handlers load correctly.
  const activeUrl = reg?.active?.scriptURL || reg?.installing?.scriptURL || '';
  if (reg && activeUrl && !activeUrl.includes(swPath.replace(/^\//, ''))) {
    await reg.unregister();
    reg = null;
  }

  if (!reg) {
    reg = await navigator.serviceWorker.register(swPath);
  }

  return navigator.serviceWorker.ready;
}

export async function getExistingSubscription() {
  if (!isPushSupported()) return null;

  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return null;

  return reg.pushManager.getSubscription();
}

export async function subscribeToPush(vapidPublicKey) {
  // Permission first — keeps the browser user-gesture while the prompt shows.
  const permission = await requestNotificationPermission();
  if (permission === 'denied') {
    throw new Error('PERMISSION_BLOCKED');
  }
  if (permission !== 'granted') {
    throw new Error('PERMISSION_DENIED');
  }

  const reg = await getPushRegistration();
  if (!reg) throw new Error('Service worker is not available.');

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }

  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub),
  });

  if (!res.ok) throw new Error('Failed to save subscription');
  return sub;
}

export async function unsubscribeFromPush() {
  const sub = await getExistingSubscription();
  if (!sub) return;

  await fetch('/api/push/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  });

  await sub.unsubscribe();
}
