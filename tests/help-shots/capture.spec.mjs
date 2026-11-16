import { test, devices } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { SHOTS } from './shots.mjs';

const require = createRequire(import.meta.url);
const sharp = require('sharp'); // Comes with Next.js.

const SITE = (process.env.SHOTS_SITE || 'http://localhost:3000').replace(/\/$/, '');
const CMS = (process.env.SHOTS_CMS || process.env.NEXT_PUBLIC_WP_BASE_URL || '').replace(/\/$/, '');
const OUT = process.env.SHOTS_OUT;
const ONLY = process.env.SHOTS_ONLY ? new RegExp(process.env.SHOTS_ONLY) : null;
const MAX_BYTES = 150 * 1024;
const WIDTH = { desktop: 1280, phone: 780, iphone: 780 }; // Phones: 390 px screens at 2×.

const DEVICES = {
  desktop: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
  phone: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
  iphone: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
};

test.beforeAll(() => {
  if (!OUT || !fs.existsSync(OUT)) throw new Error('Set SHOTS_OUT to the plugin folder plugins/karamoja-core/assets/help (it must exist).');
});

/** No real personal data on a picture: other people's emails and phone numbers become placeholders. */
async function scrub(page) {
  await page.evaluate(() => {
    const email = /[A-Za-z0-9._%+-]+@(?!example\.org\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
    const phone = /(?:\+|\b0)\d[\d\s()-]{7,}\d/g;
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const t = n.nodeValue;
      if (email.test(t) || phone.test(t)) n.nodeValue = t.replace(email, 'name@example.org').replace(phone, '+254 700 000 000');
    }
    document.querySelectorAll('input, textarea').forEach((el) => {
      if (email.test(el.value)) el.value = el.value.replace(email, 'name@example.org');
    });
    document.querySelector('nextjs-portal')?.remove(); // Development badge.
  });
}

async function signInPartner(page) {
  const email = process.env.SHOTS_PARTNER_EMAIL;
  const pass = process.env.SHOTS_PARTNER_PASSWORD;
  if (!email || !pass) throw new Error('Set SHOTS_PARTNER_EMAIL and SHOTS_PARTNER_PASSWORD (the test partner).');
  await page.goto(`${SITE}/partners-stakeholders`);
  await page.getByRole('button', { name: /^Sign in$/ }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel(/Email/).fill(email);
  await dialog.getByLabel(/Password/).fill(pass);
  await dialog.getByRole('button', { name: /Sign in/ }).click();
  await page.getByRole('button', { name: /Submit Advisory/ }).first().waitFor({ timeout: 30_000 });
}

async function signInStaff(page) {
  const user = process.env.SHOTS_WP_USER;
  const pass = process.env.SHOTS_WP_PASSWORD;
  if (!CMS || !user || !pass) throw new Error('Set SHOTS_CMS (or NEXT_PUBLIC_WP_BASE_URL), SHOTS_WP_USER and SHOTS_WP_PASSWORD (a staff account).');
  await page.goto(`${CMS}/wp-login.php`);
  await page.fill('#user_login', user);
  await page.fill('#user_pass', pass);
  await Promise.all([page.waitForURL(/wp-admin/, { timeout: 60_000 }), page.click('#wp-submit')]);
}

/** Item ids the staff shots need, found in wp-admin (or given in SHOTS_PENDING_ALERT / SHOTS_PUBLISHED_ALERT / SHOTS_TEST_ORG). */
async function staffContext(page) {
  const firstId = async (query) => {
    await page.goto(`${CMS}/wp-admin/edit.php?${query}`);
    const id = await page.locator('#the-list tr[id^="post-"]').first().getAttribute('id').catch(() => null);
    return id ? Number(id.replace('post-', '')) : null;
  };
  return {
    pendingAlert: Number(process.env.SHOTS_PENDING_ALERT) || await firstId('post_type=tk_alert&post_status=pending'),
    publishedAlert: Number(process.env.SHOTS_PUBLISHED_ALERT) || await firstId('post_type=tk_alert&post_status=publish'),
    testOrg: Number(process.env.SHOTS_TEST_ORG) || await firstId(`post_type=tk_organization&s=${encodeURIComponent(process.env.SHOTS_TEST_ORG_NAME || 'Example Pastoralist Network')}`),
  };
}

/** WebP at most 150 KB: lower quality first, then a little smaller. */
async function saveWebp(png, file, width) {
  let w = width;
  for (let round = 0; round < 6; round += 1) {
    for (const quality of [82, 72, 62, 52]) {
      const buf = await sharp(png).resize({ width: w, withoutEnlargement: true }).webp({ quality, effort: 6 }).toBuffer();
      if (buf.length <= MAX_BYTES) {
        fs.writeFileSync(file, buf);
        return { bytes: buf.length, quality, width: Math.min(w, (await sharp(png).metadata()).width) };
      }
    }
    w = Math.round(w * 0.88);
  }
  throw new Error(`${path.basename(file)} stays above 150 KB: capture a smaller part (target) instead.`);
}

for (const shot of SHOTS) {
  test(shot.name, async ({ browser }) => {
    test.skip(Boolean(ONLY && !ONLY.test(shot.name)), 'not in SHOTS_ONLY');
    const context = await browser.newContext({ ...DEVICES[shot.device], locale: 'en-GB', timezoneId: 'Africa/Nairobi', serviceWorkers: 'block' });
    const page = await context.newPage();
    try {
      let ctx = {};
      if (shot.as === 'partner') await signInPartner(page);
      if (shot.as === 'staff') {
        await signInStaff(page);
        ctx = await staffContext(page);
      }
      const where = typeof shot.path === 'function' ? shot.path(ctx) : shot.path;
      const url = shot.as === 'staff' ? `${CMS}/wp-admin/${where}` : `${SITE}${where}`;
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      if (shot.prepare) await shot.prepare(page, ctx);
      await scrub(page);
      const target = shot.target ? shot.target(page) : null;
      const png = target
        ? await target.screenshot({ animations: 'disabled' })
        : await page.screenshot({ animations: 'disabled', ...(shot.clip ? { clip: shot.clip } : {}) });
      const info = await saveWebp(png, path.join(OUT, shot.name), WIDTH[shot.device]);
      console.log(`  ${shot.name.padEnd(34)} ${String(Math.round(info.bytes / 1024)).padStart(4)} KB  q${info.quality}  ${info.width}px  → ${shot.article}`);
    } finally {
      await context.close();
    }
  });
}
