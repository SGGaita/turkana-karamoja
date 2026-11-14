import { getSession, sendJson } from '../../../lib/server/session';

/** GET /api/auth/session → { signedIn, email }. The token itself never leaves the server. */
export default function handler(req, res) {
  const s = getSession(req);
  return sendJson(res, 200, s ? { signedIn: true, email: s.email } : { signedIn: false, email: '' });
}
