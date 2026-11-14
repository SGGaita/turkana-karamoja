import { clearCookies, sameSite, sendJson } from '../../../lib/server/session';

/** POST /api/auth/logout → ends the session on this device. */
export default function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { message: 'Method not allowed' });
  if (!sameSite(req)) return sendJson(res, 403, { message: 'Forbidden' });
  return sendJson(res, 200, { signedIn: false }, clearCookies(req));
}
