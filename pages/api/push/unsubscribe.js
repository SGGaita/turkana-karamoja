import { removeSubscription } from '../../../lib/push-store';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const { endpoint } = req.body || {};
  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'Missing endpoint' });
  }

  try {
    await removeSubscription(endpoint);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[push/unsubscribe]', err.message);
    return res.status(502).json({ error: 'Could not remove subscription' });
  }
}
