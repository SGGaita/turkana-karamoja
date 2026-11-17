/**
 * Offline use (FE-09), page side. Decides when to ask the service worker (public/offline-sw.js) to save pages, and
 * keeps the "Save for offline" documents.
 *
 * - Main pages: once per website build, after the first visit (skipped on slow or data-saving connections).
 * - Content (active alerts, latest reports and initiatives, organisations, help — `karamoja/v1/offline-manifest`,
 *   counts from Site settings → Install and offline): after installing the app or pressing "Download for offline use",
 *   then again on opening and when the connection comes back, at most every 6 hours.
 */
import { FILES_PREFIX, REWARM_MS, STATIC_ROUTES, CACHES } from './offline-config';
import { SITE_LOCALES, localePath } from './locales';
import { track } from './analytics';

const STATE_KEY = 'kc_offline';
const FILES_KEY = 'kc_saved_files';

export { STATIC_ROUTES };

/** Page data address of a page in a build. */
export function dataPath(buildId, path) {
  return `/_next/data/${buildId}${path === '/' ? '/index' : path}.json`;
}

/** Slow or data-saving connection: nothing is saved automatically. */
export function connectionIsSlow(conn) {
  if (!conn) return false;
  return conn.saveData === true || /(^|-)2g$/.test(String(conn.effectiveType || ''));
}

/** Opened as the installed app. */
export function isInstalled(win = typeof window !== 'undefined' ? window : null) {
  if (!win) return false;
  return Boolean(win.matchMedia?.('(display-mode: standalone)').matches || win.navigator?.standalone === true);
}

function storage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

/** { build: { id, at }, content: { at, total, failed, manual }, optIn } */
export function readState() {
  try {
    return JSON.parse(storage()?.getItem(STATE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

export function writeState(patch) {
  const next = { ...readState(), ...patch };
  try {
    storage()?.setItem(STATE_KEY, JSON.stringify(next));
  } catch {
    /* Private mode or full: keep going without remembering. */
  }
  return next;
}

/** The main pages of this build are not saved yet. */
export function needsCore(state, buildId) {
  return Boolean(buildId) && state?.build?.id !== buildId;
}

/** Content should be (re)saved now. */
export function needsContent(state, { installed, now = Date.now() }) {
  if (!installed && !state?.optIn) return false;
  const at = Number(state?.content?.at || 0);
  return !at || now - at >= REWARM_MS || Boolean(state?.content?.failed);
}

/** Paths from `karamoja/v1/offline-manifest`, website pages only. */
export function contentPaths(manifest) {
  const list = Array.isArray(manifest?.paths) ? manifest.paths : [];
  return Array.from(new Set(list.filter((p) => typeof p === 'string' && /^\/(?!\/)[^\s?#]*$/.test(p))));
}

export async function fetchOfflineManifest(base = process.env.NEXT_PUBLIC_WP_BASE_URL) {
  const root = String(base || '').replace(/\/$/, '');
  if (!root) return null;
  const res = await fetch(`${root}/wp-json/karamoja/v1/offline-manifest`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`offline-manifest ${res.status}`);
  return res.json();
}

/** Asks the browser not to clear what is saved when space runs low. */
export async function requestPersist() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist();
  } catch {
    /* Not supported. */
  }
}

let seq = 0;
/**
 * Sends a save job to the service worker. Resolves with the KC_WARM_DONE message.
 *
 * @param {'core'|'content'} group
 * @param {string[]} paths
 * @param {string} buildId
 * @param {(msg: object) => void} [onProgress]
 */
export async function warm(group, paths, buildId, onProgress) {
  const reg = await navigator.serviceWorker.ready;
  const worker = navigator.serviceWorker.controller || reg.active;
  if (!worker) throw new Error('no service worker');
  seq += 1;
  const id = `${group}-${Date.now()}-${seq}`;
  return new Promise((resolve) => {
    const listen = (event) => {
      const msg = event.data || {};
      if (msg.id !== id) return;
      if (msg.type === 'KC_WARM_PROGRESS') onProgress?.(msg);
      if (msg.type === 'KC_WARM_DONE') {
        navigator.serviceWorker.removeEventListener('message', listen);
        resolve(msg);
      }
    };
    navigator.serviceWorker.addEventListener('message', listen);
    worker.postMessage({ type: 'KC_WARM', id, group, buildId, paths, locales: SITE_LOCALES });
  });
}

/* ── Saved documents ─────────────────────────────────────────────────────────────────────────────── */

/** The website's own address for a CMS upload, or null (only uploads can be saved). */
export function localFileUrl(url, base = process.env.NEXT_PUBLIC_WP_BASE_URL) {
  const root = `${String(base || '').replace(/\/$/, '')}/wp-content/uploads/`;
  if (!url || root === '/wp-content/uploads/' || !String(url).startsWith(root)) return null;
  const rest = String(url).slice(root.length).split(/[?#]/)[0];
  if (!rest || rest.split('/').some((part) => part === '..' || part === '')) return null;
  return FILES_PREFIX + rest;
}

/** [{ local, url, title, label, reportPath, size, savedAt }] */
export function savedFiles() {
  try {
    const list = JSON.parse(storage()?.getItem(FILES_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeFiles(list) {
  try {
    storage()?.setItem(FILES_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('kc-saved-files'));
}

/** Downloads a document into the device's saved files. */
export async function saveFile({ url, title, label, reportPath }) {
  const local = localFileUrl(url);
  if (!local) throw new Error('not a CMS upload');
  const res = await fetch(local, { credentials: 'omit' });
  if (!res.ok || res.redirected) throw new Error(`HTTP ${res.status}`);
  // A missing file can come back as the CMS's "not found" web page; never keep that as the document.
  if (/text\/html/i.test(res.headers.get('content-type') || '')) throw new Error('not a document');
  const size = Number(res.headers.get('content-length')) || null;
  const cache = await caches.open(CACHES.saved);
  await cache.put(new Request(window.location.origin + local), res);
  await requestPersist();
  const entry = { local, url, title: title || '', label: label || '', reportPath: reportPath || '', size, savedAt: Date.now() };
  writeFiles([entry, ...savedFiles().filter((f) => f.local !== local)]);
  track('offline_document_save', { file_name: local.split('/').pop() });
  return entry;
}

export async function removeFile(local) {
  try {
    const cache = await caches.open(CACHES.saved);
    await cache.delete(window.location.origin + local);
  } catch {
    /* ignore */
  }
  writeFiles(savedFiles().filter((f) => f.local !== local));
}

/** Drops list entries whose file is gone (browser cleared storage). */
export async function checkSavedFiles() {
  if (typeof caches === 'undefined') return savedFiles();
  const cache = await caches.open(CACHES.saved);
  const list = savedFiles();
  const kept = [];
  for (const f of list) {
    if (await cache.match(window.location.origin + f.local)) kept.push(f);
  }
  if (kept.length !== list.length) writeFiles(kept);
  return kept;
}

/** "14 Nov 2026, 22:10" in East Africa time. */
export function formatSavedAt(ms) {
  if (!ms) return '';
  return new Date(ms).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi',
  });
}

/**
 * What to save for one language (FE-26): its own addresses (/sw/reports) and a saved-pages list per language, so
 * switching language saves that language's pages without dropping the other's.
 */
export function forLocale(locale, paths) {
  return Array.from(new Set((paths || []).map((p) => localePath(p, locale))));
}
export function groupFor(group, locale) {
  return locale && locale !== SITE_LOCALES[0] ? `${group}-${locale}` : group;
}
