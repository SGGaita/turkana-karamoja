import fs from 'fs';
import path from 'path';
import webpush from 'web-push';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'push-subscriptions.json');

function readSubs() {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeSubs(subs) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(subs, null, 2));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const secret = process.env.PUSH_BROADCAST_SECRET;
  if (!secret || req.headers['x-push-secret'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.org';

  if (!publicKey || !privateKey) {
    return res.status(503).json({ error: 'VAPID keys not configured' });
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const { title = 'New climate alert', body = 'A new advisory has been published.', url = '/early-warnings' } = req.body || {};
  const payload = JSON.stringify({ title, body, url });

  const subs = readSubs();
  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(sub, payload).catch(async (err) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          return { expired: sub.endpoint };
        }
        throw err;
      })
    )
  );

  const expired = results
    .filter((r) => r.status === 'fulfilled' && r.value?.expired)
    .map((r) => r.value.expired);

  if (expired.length) {
    const remaining = subs.filter((s) => !expired.includes(s.endpoint));
    writeSubs(remaining);
  }

  const sent = results.filter((r) => r.status === 'fulfilled' && !r.value?.expired).length;

  return res.status(200).json({ ok: true, sent, total: subs.length });
}
