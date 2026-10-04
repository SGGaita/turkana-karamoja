/**
 * Server-only: push subscriptions are stored in WordPress (mu-plugin turkana-web-push.php),
 * because Vercel's filesystem is read-only/ephemeral and can't hold a JSON file.
 * All calls authenticate with the shared PUSH_BROADCAST_SECRET (== TK_HUB_PUSH_SECRET in WP).
 */

function wpPushUrl(path = '') {
  const base = (process.env.WP_INTERNAL_URL || process.env.NEXT_PUBLIC_WP_BASE_URL || '').replace(/\/$/, '');
  if (!base) throw new Error('NEXT_PUBLIC_WP_BASE_URL is not configured');
  return `${base}/wp-json/tk/v1/push/subscriptions${path}`;
}

async function wpPushFetch(path, { method = 'GET', body } = {}) {
  const secret = process.env.PUSH_BROADCAST_SECRET;
  if (!secret) throw new Error('PUSH_BROADCAST_SECRET is not configured');

  const res = await fetch(wpPushUrl(path), {
    method,
    headers: { 'Content-Type': 'application/json', 'x-push-secret': secret },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`WP push store ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export function isValidSubscription(sub) {
  return Boolean(
    sub
    && typeof sub.endpoint === 'string'
    && sub.endpoint.startsWith('https://')
    && sub.keys?.p256dh
    && sub.keys?.auth
  );
}

export async function saveSubscription(sub, userAgent = '') {
  return wpPushFetch('', {
    method: 'POST',
    body: { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth }, userAgent },
  });
}

export async function removeSubscription(endpoint) {
  return wpPushFetch('', { method: 'DELETE', body: { endpoint } });
}

export async function listSubscriptions() {
  const all = [];
  const perPage = 500;
  for (let page = 1; page <= 200; page += 1) {
    const data = await wpPushFetch(`?page=${page}&per_page=${perPage}`);
    all.push(...(data.subscriptions || []));
    if (all.length >= data.total || (data.subscriptions || []).length < perPage) break;
  }
  return all;
}

export async function pruneSubscriptions(endpoints) {
  if (!endpoints.length) return { deleted: 0 };
  return wpPushFetch('/prune', { method: 'POST', body: { endpoints } });
}
