import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  STATIC_ROUTES, connectionIsSlow, contentPaths, dataPath, isInstalled, localFileUrl, needsContent, needsCore,
} from '../lib/offline';
import { CACHES, FILES_PREFIX, LIMITS, REWARM_MS } from '../lib/offline-config';

const ROOT = path.join(__dirname, '..');
const CMS = 'https://cms.example.org';

describe('what gets saved when', () => {
  it('saves the main pages once per build', () => {
    expect(needsCore({}, 'b1')).toBe(true);
    expect(needsCore({ build: { id: 'b1' } }, 'b1')).toBe(false);
    expect(needsCore({ build: { id: 'b1' } }, 'b2')).toBe(true);
    expect(needsCore({}, '')).toBe(false);
  });

  it('saves content only for the installed app or after "Download for offline use", at most every 6 hours', () => {
    const now = 1_800_000_000_000;
    expect(needsContent({}, { installed: false, now })).toBe(false);
    expect(needsContent({}, { installed: true, now })).toBe(true);
    expect(needsContent({ optIn: true }, { installed: false, now })).toBe(true);
    expect(needsContent({ optIn: true, content: { at: now - 60_000 } }, { installed: false, now })).toBe(false);
    expect(needsContent({ optIn: true, content: { at: now - REWARM_MS } }, { installed: false, now })).toBe(true);
    expect(needsContent({ optIn: true, content: { at: now - 60_000, failed: 2 } }, { installed: false, now })).toBe(true);
  });

  it('treats data-saving and 2G connections as slow', () => {
    expect(connectionIsSlow({ saveData: true, effectiveType: '4g' })).toBe(true);
    expect(connectionIsSlow({ effectiveType: '2g' })).toBe(true);
    expect(connectionIsSlow({ effectiveType: 'slow-2g' })).toBe(true);
    expect(connectionIsSlow({ effectiveType: '3g' })).toBe(false);
    expect(connectionIsSlow(undefined)).toBe(false);
  });

  it('knows when it runs as the installed app', () => {
    expect(isInstalled({ matchMedia: () => ({ matches: true }), navigator: {} })).toBe(true);
    expect(isInstalled({ matchMedia: () => ({ matches: false }), navigator: { standalone: true } })).toBe(true);
    expect(isInstalled({ matchMedia: () => ({ matches: false }), navigator: {} })).toBe(false);
  });
});

describe('addresses', () => {
  it('builds Next.js page-data addresses', () => {
    expect(dataPath('abc', '/')).toBe('/_next/data/abc/index.json');
    expect(dataPath('abc', '/reports/drought-12')).toBe('/_next/data/abc/reports/drought-12.json');
  });

  it('keeps only website paths from the CMS list', () => {
    expect(contentPaths({ paths: ['/reports/a-1', '/reports/a-1', 'https://x.example/', '//x.example/a', '/a b', '/help/x?y=1', 5] }))
      .toEqual(['/reports/a-1']);
    expect(contentPaths(null)).toEqual([]);
  });

  it('saves only CMS uploads, under the website address', () => {
    expect(localFileUrl(`${CMS}/wp-content/uploads/2026/11/outlook.pdf`, CMS)).toBe(`${FILES_PREFIX}2026/11/outlook.pdf`);
    expect(localFileUrl(`${CMS}/wp-content/uploads/2026/11/a.pdf?ver=2`, `${CMS}/`)).toBe('/cms-files/2026/11/a.pdf');
    expect(localFileUrl('https://elsewhere.example/wp-content/uploads/a.pdf', CMS)).toBeNull();
    expect(localFileUrl(`${CMS}/wp-content/uploads/../wp-config.php`, CMS)).toBeNull();
    expect(localFileUrl(`${CMS}/wp-content/uploads/a.pdf`, '')).toBeNull();
  });
});

describe('service worker and settings agree', () => {
  const sw = fs.readFileSync(path.join(ROOT, 'public/offline-sw.js'), 'utf8');
  const config = fs.readFileSync(path.join(ROOT, 'next.config.js'), 'utf8');

  it('uses the same cache names and file prefix', () => {
    expect(sw).toContain(`const PAGES = '${CACHES.pages}'`);
    expect(sw).toContain(`const DATA = '${CACHES.data}'`);
    expect(sw).toContain(`const SAVED = '${CACHES.saved}'`);
    expect(sw).toContain(`const FILES_PREFIX = '${FILES_PREFIX}'`);
    expect(config).toContain(`url.pathname.startsWith('${FILES_PREFIX}')`);
    expect(config).toContain("importScripts: ['/push-handler.js', '/offline-sw.js']");
  });

  it('caps every runtime cache', () => {
    for (const key of ['pages', 'data', 'images', 'media', 'tiles', 'api', 'fonts']) {
      expect(LIMITS[key].maxEntries).toBeGreaterThan(0);
      expect(LIMITS[key].maxAgeSeconds).toBeGreaterThan(0);
    }
    expect(LIMITS.tiles).toEqual({ maxEntries: 300, maxAgeSeconds: 30 * 24 * 3600 });
  });

  it('never stores sign-in or portal calls', () => {
    expect(config).toMatch(/url\.pathname\.startsWith\('\/api\/'\),\s*handler: 'NetworkOnly'/);
  });

  it('lists only routes that exist as pages', () => {
    for (const route of STATIC_ROUTES) {
      const base = route === '/' ? 'index' : route.slice(1);
      const exists = [`pages/${base}.js`, `pages/${base}/index.js`].some((f) => fs.existsSync(path.join(ROOT, f)));
      expect(exists, route).toBe(true);
    }
  });
});
