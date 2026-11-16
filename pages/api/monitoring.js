import { monitoringDsn, tunnelTarget } from '../../lib/monitoring-shared';

/**
 * Error reports from the browser (FE-27), forwarded to Sentry. Only to the configured project, at most 256 KB.
 * POST /api/monitoring (the Sentry SDK's `tunnel`).
 */
export const config = { api: { bodyParser: false } };

const MAX = 256 * 1024;

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX) throw new Error('too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  const dsn = monitoringDsn();
  if (!dsn) return res.status(404).end();
  let body;
  try {
    body = await readBody(req);
  } catch {
    return res.status(413).end();
  }
  const target = tunnelTarget(body, dsn);
  if (!target) return res.status(400).end();
  try {
    const up = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-sentry-envelope' },
      body,
      signal: AbortSignal.timeout(5000),
    });
    return res.status(up.status === 429 ? 429 : 200).end();
  } catch {
    return res.status(502).end();
  }
}
