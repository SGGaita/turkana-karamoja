import { expect, test } from '@playwright/test';
import { ROUTES } from './routes.mjs';

const BASELINE = process.env.VISUAL_MODE === 'baseline';

// Things that change between visits or can't be reached reliably: map tiles, live times, the captcha, video.
const MASK = ['.leaflet-container', 'iframe', 'video', '[data-visual-mask]', 'time'];

async function settle(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {}); // Tiles may never go idle.
  await page.evaluate(() => document.fonts && document.fonts.ready);
  // Lazy images: scroll through once, then back to the top.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
}

async function resolvePath(page, route) {
  if (route.path) return route.path;
  await page.goto(route.detail.from);
  await settle(page);
  const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => new URL(a.href, location.href).pathname));
  return hrefs.find((h) => route.detail.link.test(h)) || null;
}

for (const route of ROUTES) {
  test(route.name, async ({ page }) => {
    test.skip(BASELINE && route.since === 'new', 'Not on the frozen sandbox: no "before" picture.');
    const path = await resolvePath(page, route);
    test.skip(!path, `No ${route.name} link on ${route.detail?.from} (nothing published of that kind).`);
    await page.goto(path);
    await settle(page);
    await expect(page).toHaveScreenshot(`${route.name}.png`, {
      fullPage: true,
      mask: MASK.map((s) => page.locator(s)),
    });
  });
}
