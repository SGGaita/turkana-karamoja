/**
 * Visit statistics (FE-27): Google Analytics 4 with Consent Mode, only after the visitor chooses "Accept".
 *
 * - The measurement ID comes from Karamoja → Site settings → Analytics. Empty: nothing is asked or loaded.
 * - Nothing goes to Google before "Accept": gtag.js is not even loaded (Consent Mode "basic"). Consent defaults to
 *   denied for everything; on Accept only `analytics_storage` is granted. Advertising signals stay off.
 * - A browser sending Global Privacy Control counts as "Decline" (no question).
 * - Pages reached from password emails are never counted (their address holds a one-time key).
 * - Events go through track(); without consent they only reach `kc-analytics` browser listeners.
 */

const STORE = 'kc_consent';
const ID_RE = /^G-[A-Z0-9]{4,20}$/;

/** Pages whose address carries a one-time key: analytics never starts there. */
export const NO_ANALYTICS_PATHS = [
  '/partners-stakeholders/set-password',
  '/partners-stakeholders/reset-password',
  '/partners-stakeholders/forgot-password',
];

/** A GA4 measurement ID, or '' when it doesn't look like one. */
export function cleanMeasurementId(id) {
  const v = String(id || '').trim().toUpperCase();
  return ID_RE.test(v) ? v : '';
}

/** Is this page (path without language prefix or query) one where analytics must not start? */
export function noAnalyticsPage(pathname) {
  const p = String(pathname || '').split(/[?#]/)[0];
  return NO_ANALYTICS_PATHS.some((x) => p === x || p.startsWith(`${x}/`));
}

/** The visitor's answer: 'granted', 'denied', or '' (not asked yet). Global Privacy Control means 'denied'. */
export function readConsent(win = typeof window !== 'undefined' ? window : null) {
  if (!win) return '';
  try {
    const v = JSON.parse(win.localStorage.getItem(STORE) || 'null');
    if (v && (v.choice === 'granted' || v.choice === 'denied')) return v.choice;
  } catch {
    /* Storage blocked: ask (and then keep the answer for this page only). */
  }
  return win.navigator?.globalPrivacyControl === true ? 'denied' : '';
}

export function writeConsent(choice, win = typeof window !== 'undefined' ? window : null) {
  if (!win) return;
  try {
    win.localStorage.setItem(STORE, JSON.stringify({ choice, at: new Date().toISOString() }));
  } catch {
    /* Not saved: asked again next time. */
  }
}

let started = '';

/** Loads gtag.js and starts counting (after "Accept"). Safe to call more than once. */
export function startAnalytics(id, { language = 'en' } = {}) {
  const mid = cleanMeasurementId(id);
  if (typeof window === 'undefined' || !mid) return false;
  if (started === mid) {
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    return true;
  }
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  window.gtag('set', { ads_data_redaction: true, allow_google_signals: false, allow_ad_personalization_signals: false });
  window.gtag('set', 'user_properties', { site_language: language });
  window.gtag('js', new Date());
  window.gtag('config', mid);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(mid)}`;
  document.head.appendChild(s);
  started = mid;
  return true;
}

/** "Decline" after an "Accept": stop counting and remove Google's cookies. */
export function stopAnalytics() {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') window.gtag('consent', 'update', { analytics_storage: 'denied' });
  const host = window.location.hostname;
  for (const c of document.cookie.split(';')) {
    const name = c.split('=')[0].trim();
    if (name === '_ga' || name.startsWith('_ga_') || name === '_gid') {
      for (const domain of ['', host, `.${host.split('.').slice(-2).join('.')}`]) {
        document.cookie = `${name}=;path=/;max-age=0${domain ? `;domain=${domain}` : ''}`;
      }
    }
  }
}

/** The page's language, kept on later events (GA4 user property `site_language`). */
export function setAnalyticsLanguage(language) {
  if (started && typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('set', 'user_properties', { site_language: language });
  }
}

/**
 * An event: report downloads (`file_download`), the install offer, alert notifications, saving for offline use.
 * Sent to Google only after "Accept"; always dispatched as a `kc-analytics` browser event.
 */
export function track(name, params = {}) {
  if (typeof window === 'undefined') return;
  try {
    if (started && typeof window.gtag === 'function') window.gtag('event', name, params);
    window.dispatchEvent(new CustomEvent('kc-analytics', { detail: { event: name, ...params } }));
  } catch {
    /* Never break the page for analytics. */
  }
}

/** Asks the question again (footer "Analytics settings"). */
export function askConsentAgain() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('kc-consent-ask'));
}

/** Test hook. */
export function resetAnalyticsForTests() {
  started = '';
}
