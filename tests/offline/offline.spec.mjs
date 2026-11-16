import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';

const { STATIC_ROUTES } = createRequire(import.meta.url)('../../lib/offline-config.js');
const OFFLINE_TITLE = /You are offline/i;

/** First visit: wait for the service worker and for the main pages of this build to be saved (in one language). */
async function firstVisit(page, home = '/', locale = 'en') {
  await page.goto(home, { waitUntil: 'load' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)))) {
    await page.reload({ waitUntil: 'load' });
  }
  await expect
    .poll(
      () => page.evaluate((loc) => {
        try {
          // Saved per language since FE-26: "<build>:<language>".
          return JSON.parse(localStorage.getItem('kc_offline') || '{}').build?.id === `${window.__NEXT_DATA__.buildId}:${loc}`;
        } catch {
          return false;
        }
      }, locale),
      { timeout: 150_000, intervals: [1000] },
    )
    .toBe(true);
}

test('after the first visit, every main page opens without a connection', async ({ page, context }) => {
  await firstVisit(page);
  await context.setOffline(true);

  for (const route of STATIC_ROUTES.filter((r) => r !== '/offline')) {
    await test.step(route, async () => {
      const res = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(res?.ok(), `${route} answered`).toBeTruthy();
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('h1').first()).not.toHaveText(OFFLINE_TITLE);
      await expect(page.getByRole('status').filter({ hasText: /offline/i })).toBeVisible();
    });
  }

  // Moving between pages inside the site (page data, not full page loads).
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => window.next.router.push('/reports'));
  await expect(page).toHaveURL(/\/reports$/);
  await expect(page.locator('h1').first()).not.toHaveText(OFFLINE_TITLE);

  // A page never saved: the offline page, with the helplines.
  const res = await page.goto('/reports/never-saved-999999', { waitUntil: 'domcontentloaded' });
  expect(res?.ok()).toBeTruthy();
  await expect(page.locator('h1').first()).toHaveText(OFFLINE_TITLE);
  await context.setOffline(false);
});

test('"Download for offline use" saves current content', async ({ page, context, request }) => {
  const cms = (process.env.OFFLINE_CMS || process.env.NEXT_PUBLIC_WP_BASE_URL || '').replace(/\/$/, '');
  test.skip(!cms, 'Set OFFLINE_CMS (or NEXT_PUBLIC_WP_BASE_URL) to the CMS address.');
  const manifest = await (await request.get(`${cms}/wp-json/karamoja/v1/offline-manifest`)).json().catch(() => null);
  await firstVisit(page);
  test.skip(!manifest?.paths?.length, 'The CMS has no published content to save.');

  await page.getByRole('button', { name: /Download for offline use/i }).first().click();
  await expect(page.getByText(/Saved for offline use on/i).first()).toBeVisible({ timeout: 180_000 });

  await context.setOffline(true);
  for (const path of manifest.paths.slice(0, 5)) {
    await test.step(path, async () => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('h1').first()).not.toHaveText(OFFLINE_TITLE);
    });
  }
  await context.setOffline(false);
});

test('a Kiswahili reader gets the Kiswahili pages offline (FE-26)', async ({ page, context }) => {
  await page.goto('/sw', { waitUntil: 'load' });
  // Kiswahili not marked ready in Site settings → Languages: the site moves to English and there is nothing to test.
  await page.waitForTimeout(1500);
  test.skip(!page.url().includes('/sw'), 'Kiswahili is not marked ready in the CMS.');
  await firstVisit(page, '/sw', 'sw');
  await context.setOffline(true);
  for (const route of ['/sw/reports', '/sw/early-warnings', '/sw/help']) {
    await test.step(route, async () => {
      const res = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(res?.ok(), `${route} answered`).toBeTruthy();
      await expect(page.locator('html')).toHaveAttribute('lang', 'sw');
      await expect(page.locator('h1').first()).not.toHaveText(OFFLINE_TITLE);
    });
  }
  await context.setOffline(false);
});
