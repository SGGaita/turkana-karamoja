import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import { smokeEnv } from './env.mjs';

const require = createRequire(import.meta.url);
const { STATIC_ROUTES } = require('../../lib/offline-config.js');
const UI = require('../../lib/ui-strings.en.json');

const env = smokeEnv();
const UNAVAILABLE = UI['common.page_unavailable_title'];
// Console errors that mean something is broken for visitors (not the odd failed analytics beacon).
const SERIOUS = /Content Security Policy|Refused to (load|connect|execute|frame)|Minified React error|Hydration|did not match|ChunkLoadError|Loading chunk/i;

/** Opens a page and fails on script errors, blocked requests and React errors while it loads. */
async function open(page, path) {
  const problems = [];
  page.on('pageerror', (e) => problems.push(`script error: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && SERIOUS.test(m.text()) && problems.push(m.text()));
  const res = await page.goto(path, { waitUntil: 'load' });
  return { res, problems };
}

async function checkPage(page, path, { h1 = true } = {}) {
  let { res, problems } = await open(page, path);
  expect(res?.status(), `${path} answered`).toBeLessThan(400);
  // A page the build couldn't fill (WordPress slow or down while building) refills in the background after the
  // next visit; with a slow CMS (XAMPP, ~3 s a call, several calls for an organisation page) that takes up to ~40 s
  // after `npm run build`. Reload up to three times, 15 s apart, as a visitor would.
  for (let attempt = 1; UNAVAILABLE && attempt <= 3 && (await page.getByText(UNAVAILABLE).count()); attempt += 1) {
    test.info().annotations.push({ type: 'retried', description: `${path} said "${UNAVAILABLE}"; reload ${attempt} after 15 s` });
    await page.waitForTimeout(15_000);
    ({ res, problems } = await open(page, path));
    expect(res?.status(), `${path} answered`).toBeLessThan(400);
  }
  if (UNAVAILABLE) await expect(page.getByText(UNAVAILABLE), `${path} still can't be shown after 45 s: is WordPress reachable from the website?`).toHaveCount(0);
  if (h1) await expect(page.locator('h1').first()).toBeVisible();
  // Phones must never scroll sideways (FE-25).
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, `${path} is wider than the screen`).toBeLessThanOrEqual(1);
  await page.waitForTimeout(500); // late hydration errors
  expect(problems, `${path}: errors while loading`).toEqual([]);
}

/** The first link on a list page that goes to one of its items. */
async function firstItem(page, list, pattern) {
  await page.goto(list, { waitUntil: 'load' });
  const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  return hrefs.find((h) => pattern.test(h || '')) || null;
}

test.describe('every page @pages', () => {
  for (const path of STATIC_ROUTES) {
    test(`${path} opens without errors`, async ({ page }) => {
      await checkPage(page, path, { h1: path !== '/saved' });
    });
  }

  test('item pages: an alert, a report, an organisation, a help article', async ({ page }) => {
    const items = [
      ['/early-warnings', /^\/early-warnings\/[^/?#]+$/],
      ['/reports', /^\/reports\/[^/?#]+$/],
      ['/organizations', /^\/organizations\/[^/?#]+$/],
      ['/help', /^\/help\/(?!user-guide$|partner-guide$|faq$)[^/?#]+$/],
    ];
    for (const [list, pattern] of items) {
      await test.step(list, async () => {
        const href = await firstItem(page, list, pattern);
        if (!href) {
          test.info().annotations.push({ type: 'note', description: `${list}: nothing published to open` });
          return;
        }
        await checkPage(page, href);
      });
    }
  });
});

test.describe('languages', () => {
  for (const loc of env.locales) {
    test(`/${loc}: pages in that language`, async ({ page, request }) => {
      const res = await request.get(`/${loc}`, { maxRedirects: 0 });
      test.skip(res.status() >= 300, `/${loc} is not offered (not ticked ready in Site settings → Languages)`);
      for (const path of ['', '/early-warnings', '/reports', '/contact']) {
        await test.step(`/${loc}${path}`, async () => {
          await checkPage(page, `/${loc}${path}`);
          await expect(page.locator('html')).toHaveAttribute('lang', loc);
        });
      }
    });
  }
});

test.describe('maps', () => {
  /** The map pictures under every map on the page have loaded (not just the grey background). */
  async function tilesShow(page) {
    const maps = page.locator('.leaflet-container');
    await expect(maps.first()).toBeVisible();
    const n = await maps.count();
    for (let i = 0; i < n; i += 1) {
      await maps.nth(i).scrollIntoViewIfNeeded();
      await expect(maps.nth(i).locator('img.leaflet-tile-loaded').first(), `map ${i + 1} shows its map pictures`).toBeVisible();
    }
  }

  test('the service worker may fetch the map pictures (connect-src)', async ({ request }) => {
    // The offline service worker keeps viewed map pictures, so it fetches them itself, under /sw.js's connect-src.
    const res = await request.get('/sw.js');
    test.skip(!res.ok(), 'no service worker in this build');
    const csp = res.headers()['content-security-policy'] || '';
    const connect = (csp.match(/connect-src([^;]*)/) || [, ''])[1];
    expect(connect).toContain('https://*.basemaps.cartocdn.com');
    expect(connect).toContain('https://*.tile.openstreetmap.org');
  });

  for (const path of ['/', '/early-warnings', '/about', '/community/water-points']) {
    test(`${path}: maps show their pictures, also once the service worker is in charge`, async ({ page }) => {
      test.skip(!env.tiles, 'SMOKE_SKIP_TILES is set');
      await page.goto(path, { waitUntil: 'load' });
      await tilesShow(page);
      // Second visit, through the service worker (where the grey maps of 17 Nov came from).
      const hasWorker = await page.evaluate(async () => {
        if (!('serviceWorker' in navigator) || !(await navigator.serviceWorker.getRegistration())) return false;
        await navigator.serviceWorker.ready;
        return true;
      });
      if (!hasWorker) return;
      await page.reload({ waitUntil: 'load' });
      expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
      await tilesShow(page);
    });
  }

  test('approved advisories with a pin are on the Early warnings map', async ({ page, request }) => {
    test.skip(!env.cms, 'Set SMOKE_CMS');
    const alerts = await (await request.get(`${env.cms}/wp-json/karamoja/v1/alerts?active=1&per_page=50`)).json().catch(() => []);
    const pinned = (Array.isArray(alerts) ? alerts : []).filter((a) => a.on_map);
    await page.goto('/early-warnings', { waitUntil: 'load' });
    await expect(page.locator('.leaflet-container').first()).toBeVisible();
    if (!pinned.length) {
      test.info().annotations.push({ type: 'note', description: 'no active pinned advisory to look for' });
      return;
    }
    // Each advisory on the map is a marker that is not a community dot.
    await expect(page.locator('.leaflet-marker-icon, path.leaflet-interactive').first()).toBeVisible();
    await expect(page.getByText(/No published advisories on the map/)).toHaveCount(0);
  });
});

test.describe('security and search engines', () => {
  test('security headers', async ({ request }) => {
    const h = (await request.get('/')).headers();
    expect(h['content-security-policy']).toContain("default-src 'self'");
    expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
    if (env.https) expect(h['strict-transport-security']).toMatch(/max-age=\d{7,}/);
  });

  test('indexing matches the environment', async ({ page, request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    await page.goto('/', { waitUntil: 'load' });
    const noindex = await page.locator('meta[name="robots"][content*="noindex"]').count();
    if (env.indexing) {
      expect(robots).not.toMatch(/^Disallow:\s*\/\s*$/m);
      expect(robots).toMatch(/Sitemap:\s*https?:\/\//);
      expect(noindex).toBe(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      expect(await page.locator('link[rel="alternate"][hreflang="x-default"]').count()).toBe(1);
      expect((await request.get('/sitemap.xml')).status()).toBe(200);
    } else {
      // Sandbox, previews, local: kept out of search results.
      expect(robots).toMatch(/^Disallow:\s*\/\s*$/m);
      expect(noindex).toBeGreaterThan(0);
    }
  });

  test('old addresses redirect', async ({ request }) => {
    for (const [from, to] of [['/contact-us', '/contact'], ['/help/admin-guide', '/help'], ['/help/technical', '/help']]) {
      const res = await request.get(from, { maxRedirects: 0 });
      expect([301, 302, 307, 308], from).toContain(res.status());
      expect(new URL(res.headers().location, env.site).pathname).toBe(to);
    }
  });

  test('no links to the internal API pages', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.getByRole('link', { name: /API Access/i })).toHaveCount(0);
  });
});

test.describe('installed app', () => {
  test('manifest, icons and installability', async ({ request, browserName, playwright }, testInfo) => {
    const res = await request.get('/manifest.webmanifest');
    expect(res.ok()).toBe(true);
    const m = await res.json();
    expect(m.name).toBeTruthy();
    expect(m.start_url).toBeTruthy();
    expect(m.display).toMatch(/standalone|minimal-ui|fullscreen/);
    const big = (m.icons || []).find((i) => /(^|\s)(512x512|1024x1024)/.test(i.sizes || ''));
    expect(big, 'a 512 px icon').toBeTruthy();
    expect((await request.get(big.src)).ok(), big.src).toBe(true);

    test.skip(browserName !== 'chromium', 'installability is read from Chrome');
    // Chrome never offers installing in a private window, and Playwright's usual windows are private: use a
    // normal (throwaway) profile for this one check.
    const { launchOptions = {}, channel } = testInfo.project.use;
    const context = await playwright.chromium.launchPersistentContext(testInfo.outputPath('profile'), {
      ...launchOptions,
      ...(channel ? { channel } : {}),
      ...(process.env.PW_CHROME_PATH ? { executablePath: process.env.PW_CHROME_PATH } : {}),
      baseURL: env.site,
    });
    try {
      const page = await context.newPage();
      await page.goto('/', { waitUntil: 'load' });
      // `ready` never settles on a site without a service worker: wait 10 s at most.
      await page.evaluate(() => Promise.race([navigator.serviceWorker?.ready, new Promise((r) => setTimeout(r, 10_000))]));
      const cdp = await context.newCDPSession(page);
      const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
      expect(installabilityErrors.map((e) => e.errorId)).toEqual([]);
    } finally {
      await context.close();
    }
  });
});

test.describe('forms (looked at, never sent)', () => {
  test('contact form is there, with the captcha where expected', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'load' });
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible();
    const captcha = page.locator('iframe[src*="challenges.cloudflare.com"]');
    if (env.captcha) await expect(captcha.first()).toBeAttached({ timeout: 30_000 });
    else test.info().annotations.push({ type: 'note', description: `captcha shown: ${(await captcha.count()) > 0}` });
  });

  test('partner sign-in → dashboard → sign out (test account)', async ({ page, context }) => {
    test.skip(!env.partner.user || !env.partner.pass, 'Set SMOKE_PARTNER_USER and SMOKE_PARTNER_PASSWORD (a test account)');
    await page.goto('/partners-stakeholders', { waitUntil: 'load' });
    await page.getByLabel('Email').fill(env.partner.user);
    await page.getByLabel('Password', { exact: true }).fill(env.partner.pass);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Sign out').first()).toBeVisible({ timeout: 30_000 });
    // The sign-in stays on the website's server: httpOnly cookie, nothing in the page's storage (FE-06).
    const session = (await context.cookies()).find((c) => c.name === 'kc_session');
    expect(session?.httpOnly).toBe(true);
    expect(await page.evaluate(() => Object.keys(sessionStorage).concat(Object.keys(localStorage)).filter((k) => /jwt|token/i.test(k)))).toEqual([]);
    await page.getByText('Sign out').first().click();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });
});
