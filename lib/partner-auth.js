/**
 * Partner account flows served by Karamoja Core (karamoja/v1/auth/*).
 *
 * Until the CMS cut-over these routes don't exist yet; `coreAuthAvailable()` checks for them so the
 * website can fall back to WordPress's own lost-password screen.
 */
import { getWpBaseUrl } from './wordpress';

let available = null;

/** Does the CMS serve Core's auth routes? (Cached per page load.) */
export async function coreAuthAvailable() {
  if (available !== null) return available;
  const base = getWpBaseUrl();
  if (!base) return (available = false);
  try {
    const res = await fetch(`${base}/wp-json/karamoja/v1`);
    const json = await res.json();
    available = Boolean(json?.routes && json.routes['/karamoja/v1/auth/password/forgot']);
  } catch {
    available = false;
  }
  return available;
}

/** WordPress's own lost-password screen (interim, before cut-over). */
export function wpLostPasswordUrl() {
  const base = getWpBaseUrl();
  return base ? `${base}/wp-login.php?action=lostpassword` : '';
}

async function post(path, body, token) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('This service is unavailable right now. Please try again later.');
  const res = await fetch(`${base}/wp-json/karamoja/v1${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || 'Something went wrong. Please try again.');
    err.code = json.code || '';
    err.status = res.status;
    throw err;
  }
  return json;
}

/** Asks for a reset link. The answer is the same whether or not the email has an account. */
export const requestPasswordReset = (email, captchaToken) =>
  post('/auth/password/forgot', { email, captcha_token: captchaToken || '' });

/** Saves a first password from the "set your password" email link. */
export const setPassword = (uid, token, password) =>
  post('/auth/password/set', { uid, token, password });

/** Saves a new password from a reset email link. */
export const resetPassword = (uid, token, password) =>
  post('/auth/password/reset', { uid, token, password });

/** Sends a fresh set-password link (for accounts still waiting for one). */
export const resendSetupLink = (email) => post('/auth/password/resend-setup', { email });

/** Signed in: changes the password and returns a new sign-in token. */
export const changePassword = (jwt, currentPassword, password) =>
  post('/auth/password/change', { current_password: currentPassword, password }, jwt);

/** Signs in through Core (clear messages for locked or not-yet-active accounts). */
export const coreLogin = (email, password) => post('/auth/login', { email, password });

/**
 * Rough strength hint shown while typing (the CMS has the final say).
 * @returns {{ score: number, label: string, color: string }}
 */
export function passwordHint(pw) {
  const p = String(pw || '');
  if (!p) return { score: 0, label: '', color: '#9A9A9A' };
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/].filter((r) => r.test(p)).length;
  let score = 0;
  if (p.length >= 10) score += 1;
  if (p.length >= 14) score += 1;
  if (classes >= 3 || (p.length >= 16 && /\s|-/.test(p))) score += 1;
  if (/(.)\1{3,}|1234|abcd|qwer|password/i.test(p)) score = Math.min(score, 1);
  if (p.length < 10) score = 0;
  const levels = [
    { label: 'Too short — use at least 10 characters', color: '#B91C1C' },
    { label: 'Weak', color: '#B45309' },
    { label: 'Good', color: '#2E7BB4' },
    { label: 'Strong', color: '#047857' },
  ];
  return { score, ...levels[score] };
}
