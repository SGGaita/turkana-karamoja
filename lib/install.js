/**
 * Install offer (FE-10): when to offer installing the app, from Site settings → Install and offline
 * (`karamoja/v1/pwa` → install_prompt; defaults in lib/pwa.js).
 *
 * State per device (localStorage kc_install): { visits, lastSeen, dismissals, snoozedUntil, installedAt }.
 * A visit is a session: a new one starts after 30 minutes away.
 */
import { DEFAULT_PWA } from './pwa';

const KEY = 'kc_install';
const VISIT_GAP_MS = 30 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Settings with defaults and limits. */
export function promptSettings(value) {
  const d = DEFAULT_PWA.install_prompt;
  const v = value && typeof value === 'object' ? value : {};
  const num = (x, def, min, max) => (Number.isFinite(Number(x)) ? Math.min(max, Math.max(min, Math.round(Number(x)))) : def);
  return {
    show_after: ['second_visit', 'after_30s', 'first_visit', 'never'].includes(v.show_after) ? v.show_after : d.show_after,
    pages: ['all', 'home_alerts', 'home'].includes(v.pages) ? v.pages : d.pages,
    seconds: num(v.seconds, d.seconds, 0, 300),
    snooze_days: num(v.snooze_days, d.snooze_days, 1, 90),
    max_dismissals: num(v.max_dismissals, d.max_dismissals, 1, 10),
  };
}

/** iPhone / iPad (also iPadOS reporting as a Mac): install only through Share → Add to Home Screen. */
export function isIos(ua = '', maxTouchPoints = 0) {
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && maxTouchPoints > 1);
}

/** The offer may appear on this page. */
export function pageAllowed(pages, path) {
  const p = String(path || '/').split(/[?#]/)[0];
  if (pages === 'home') return p === '/';
  if (pages === 'home_alerts') return p === '/' || p === '/early-warnings' || p.startsWith('/early-warnings/');
  return !p.startsWith('/partners-stakeholders/dashboard');
}

/**
 * Whether to offer installing now.
 *
 * @returns {'show'|'after30s'|'no'}
 */
export function decide({ settings, state, path, now = Date.now(), canInstall, installed }) {
  const s = promptSettings(settings);
  if (installed || !canInstall || s.show_after === 'never') return 'no';
  if (!pageAllowed(s.pages, path)) return 'no';
  if ((state?.dismissals || 0) >= s.max_dismissals) return 'no';
  if ((state?.snoozedUntil || 0) > now) return 'no';
  if (state?.installedAt) return 'no';
  if (s.show_after === 'second_visit') return (state?.visits || 0) >= 2 ? 'show' : 'no';
  if (s.show_after === 'after_30s') return 'after30s';
  return 'show';
}

/** Counts a visit when the last activity was 30 minutes ago or more. */
export function countVisit(state, now = Date.now()) {
  const last = Number(state?.lastSeen || 0);
  const visits = Number(state?.visits || 0);
  return { ...state, visits: !last || now - last >= VISIT_GAP_MS ? visits + 1 : Math.max(1, visits), lastSeen: now };
}

/** After "Later": one more dismissal, and quiet for the snooze days. */
export function dismiss(state, settings, now = Date.now()) {
  const s = promptSettings(settings);
  return { ...state, dismissals: Number(state?.dismissals || 0) + 1, snoozedUntil: now + s.snooze_days * DAY_MS };
}

export function readInstallState() {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || '{}') || {};
  } catch {
    return {};
  }
}

export function writeInstallState(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* Private mode: the offer may come back; harmless. */
  }
  return state;
}

/**
 * Analytics: `install_prompt_shown`, `install_prompt_dismissed`, `install_prompt_accepted`, `app_installed`.
 * Sent to Google Tag Manager / gtag when the site has one, and as a `kc-analytics` browser event for anything else.
 */
export function track(name, params = {}) {
  if (typeof window === 'undefined') return;
  const detail = { event: name, ...params };
  try {
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(detail);
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
    window.dispatchEvent(new CustomEvent('kc-analytics', { detail }));
  } catch {
    /* Never break the page for analytics. */
  }
}
