export const ORG_KEY = 'tk_hub_org';
export const TOKEN_KEY = 'tk_hub_jwt';
export const USER_EMAIL_KEY = 'tk_hub_user_email';

export function saveOrgSession(org) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ORG_KEY, JSON.stringify(org));
}

export function loadOrgSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ORG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearOrgSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ORG_KEY);
}

export function isOrgApproved(org) {
  return org?.approved === true || org?.status === 'approved';
}

/** Read the signed-in editor's JWT + email from sessionStorage (client only). */
export function loadAuthSession() {
  if (typeof window === 'undefined') return { token: null, email: '' };
  return {
    token: sessionStorage.getItem(TOKEN_KEY),
    email: sessionStorage.getItem(USER_EMAIL_KEY) || '',
  };
}

export function saveAuthSession(token, email) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(TOKEN_KEY, token);
  if (email) sessionStorage.setItem(USER_EMAIL_KEY, email);
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_EMAIL_KEY);
}
