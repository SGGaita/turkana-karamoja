/* Offline use (FE-09), loaded into the service worker with importScripts (next.config.js, workboxOptions).
 *
 * - KC_WARM message from the page (lib/offline.js): saves pages and their page data (`/_next/data/<build>/…json`) into
 *   the same caches Workbox reads from (kc-pages, kc-data), a few at a time, reporting progress to open pages.
 *   Content lists replace the previous list (items no longer listed, e.g. ended alerts, are dropped); page data of
 *   older builds is dropped.
 * - /cms-files/…: documents saved with "Save for offline" (kc-saved-files) open without a connection.
 *
 * Names must match lib/offline-config.js (tests/offline-config.test.mjs checks).
 */
/* eslint-disable no-restricted-globals */
(function kcOffline() {
  const PAGES = 'kc-pages';
  const DATA = 'kc-data';
  const SAVED = 'kc-saved-files';
  const META = 'kc-meta';
  const FILES_PREFIX = '/cms-files/';
  const PARALLEL = 3;
  const GIVE_UP_AFTER = 6; // Failures in a row: the connection is gone.

  const dataUrl = (buildId, path) => `/_next/data/${buildId}${path === '/' ? '/index' : path}.json`;

  async function tell(message) {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    list.forEach((c) => c.postMessage(message));
  }

  async function save(cache, url, init, accept) {
    const res = await fetch(url, { credentials: 'same-origin', cache: 'no-cache', ...init });
    if (!res.ok || res.redirected || !accept(res.headers.get('content-type') || '')) return false;
    await cache.put(new Request(url), res);
    return true;
  }

  async function warm({ id, group, buildId, paths }) {
    const origin = self.location.origin;
    const [pages, data, meta] = await Promise.all([caches.open(PAGES), caches.open(DATA), caches.open(META)]);
    const list = Array.from(new Set((paths || []).filter((p) => typeof p === 'string' && /^\/(?!\/)\S*$/.test(p))));
    const total = list.length;
    let done = 0;
    let failed = 0;
    let inARow = 0;
    let next = 0;

    async function one(path) {
      try {
        const okPage = await save(pages, origin + path, {}, (t) => t.includes('text/html'));
        const okData = buildId
          ? await save(data, origin + dataUrl(buildId, path), { headers: { 'x-nextjs-data': '1' } }, (t) => t.includes('json'))
          : true;
        if (okPage && okData) inARow = 0;
        else {
          failed += 1;
          inARow += 1;
        }
      } catch {
        failed += 1;
        inARow += 1;
      }
      done += 1;
      if (done % 3 === 0 || done === total) await tell({ type: 'KC_WARM_PROGRESS', id, group, done, total, failed });
    }

    async function worker() {
      while (next < list.length && inARow < GIVE_UP_AFTER) {
        const path = list[next];
        next += 1;
        // eslint-disable-next-line no-await-in-loop
        await one(path);
      }
    }
    await Promise.all(Array.from({ length: PARALLEL }, worker));

    const stopped = inARow >= GIVE_UP_AFTER;
    const key = `${origin}/__kc/warmed-${group}`;
    if (!stopped) {
      // Items no longer listed (ended alerts, older reports) leave the device.
      const before = await meta.match(key).then((r) => (r ? r.json() : [])).catch(() => []);
      const keep = new Set(list);
      await Promise.all(
        before
          .filter((p) => !keep.has(p))
          .map((p) => Promise.all([pages.delete(origin + p), buildId ? data.delete(origin + dataUrl(buildId, p)) : null])),
      );
      await meta.put(key, new Response(JSON.stringify(list), { headers: { 'content-type': 'application/json' } }));
    }
    if (buildId) {
      // Page data of earlier builds can't be used any more.
      const keys = await data.keys();
      await Promise.all(keys.filter((r) => !r.url.includes(`/_next/data/${buildId}/`)).map((r) => data.delete(r)));
    }
    await tell({ type: 'KC_WARM_DONE', id, group, total, failed: failed + (total - done), stopped, at: Date.now() });
  }

  self.addEventListener('message', (event) => {
    const msg = event.data;
    if (msg && msg.type === 'KC_WARM') event.waitUntil(warm(msg));
  });

  // Saved documents: from the device first, else the network (not stored unless the visitor chose to save).
  self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin || !url.pathname.startsWith(FILES_PREFIX)) return;
    event.respondWith(
      caches
        .open(SAVED)
        .then((c) => c.match(url.origin + url.pathname, { ignoreSearch: true, ignoreVary: true }))
        .then((hit) => hit || fetch(req)),
    );
  });
})();
