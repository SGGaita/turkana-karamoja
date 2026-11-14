export const ORG_KEY = 'tk_hub_org';
/** Where older versions kept the sign-in token in the browser (removed on load, FE-06). */
export const LEGACY_TOKEN_KEY = 'tk_hub_jwt';
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

