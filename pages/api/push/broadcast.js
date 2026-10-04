import crypto from 'crypto';
import webpush from 'web-push';
import { listSubscriptions, pruneSubscriptions } from '../../../lib/push-store';

// Give Vercel enough time to fan out to many subscribers.
export const config = { maxDuration: 60 };

const BATCH_SIZE = 100;

function secretMatches(given, expected) {
  if (!given || !expected) return false;
  const a = Buffer.from(String(given));
  const b = Buffer.from(String(expected));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  if (!secretMatches(req.headers['x-push-secret'], process.env.PUSH_BROADCAST_SECRET)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.org';

  if (!publicKey || !privateKey) {
    return res.status(503).json({ error: 'VAPID keys not configured' });
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const {
    title = 'New climate alert',
    body = 'A new advisory has been published.',
    url = '/early-warnings',
  } = req.body || {};
  const payload = JSON.stringify({ title, body, url });

  let subs;
  try {
    subs = await listSubscriptions();
  } catch (err) {
    console.error('[push/broadcast] could not load subscriptions:', err.message);
    return res.status(502).json({ error: 'Could not load subscriptions from WordPress' });
  }

  let sent = 0;
  let failed = 0;
  const expired = [];

  for (let i = 0; i < subs.length; i += BATCH_SIZE) {
    const batch = subs.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((sub) => webpush.sendNotification(sub, payload, { TTL: 60 * 60 * 24 }))
    );
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        sent += 1;
      } else if (r.reason?.statusCode === 404 || r.reason?.statusCode === 410) {
        expired.push(batch[idx].endpoint);
      } else {
        failed += 1;
        console.warn('[push/broadcast] send failed:', r.reason?.statusCode, r.reason?.body || r.reason?.message);
      }
    });
  }

  if (expired.length) {
    await pruneSubscriptions(expired).catch((err) =>
      console.warn('[push/broadcast] prune failed:', err.message)
    );
  }

  return res.status(200).json({ ok: true, sent, failed, expired: expired.length, total: subs.length });
}
