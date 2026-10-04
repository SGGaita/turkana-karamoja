import { isValidSubscription, saveSubscription } from '../../../lib/push-store';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const sub = req.body;
  if (!isValidSubscription(sub)) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  try {
    const result = await saveSubscription(sub, String(req.headers['user-agent'] || '').slice(0, 255));
    return res.status(201).json({ ok: true, count: result.count });
  } catch (err) {
    console.error('[push/subscribe]', err.message);
    return res.status(502).json({ error: 'Could not save subscription' });
  }
}
