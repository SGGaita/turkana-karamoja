import { test, expect } from '@playwright/test';
import { smokeEnv } from './env.mjs';

/**
 * The CMS, signed out (deployment guide §9). Nothing here signs in or changes anything.
 */
const env = smokeEnv();
const api = (path) => `${env.cms}/wp-json${path}`;

test.describe('CMS, signed out', () => {
  test.skip(!env.cms, 'Set SMOKE_CMS (or NEXT_PUBLIC_WP_BASE_URL in .env.local) to the CMS address');

  test('private things stay private', async ({ request }) => {
    expect((await request.get(api('/wp/v2/users'))).status(), 'user list').toBe(401);
    expect((await request.get(api('/karamoja/v1/schema'))).status(), 'page schema').toBe(401);
    expect((await request.get(api('/karamoja/v1/help?audience=staff'))).status(), 'staff help').toBe(401);
    const author = await request.get(`${env.cms}/?author=1`, { maxRedirects: 0 });
    expect(author.status(), 'author pages').toBe(404);
  });

  test('XML-RPC is switched off', async ({ request }) => {
    const res = await request.post(`${env.cms}/xmlrpc.php`, {
      headers: { 'Content-Type': 'text/xml' },
      data: '<?xml version="1.0"?><methodCall><methodName>system.listMethods</methodName></methodCall>',
    });
    expect(await res.text()).not.toContain('wp.getUsersBlogs');
  });

  test('no WordPress files that give away versions', async ({ request }) => {
    for (const f of ['/readme.html', '/license.txt', '/wp-content/debug.log']) {
      expect((await request.get(`${env.cms}${f}`)).status(), `${f} (delete it from the server)`).toBeGreaterThanOrEqual(400);
    }
  });

  test('everything WordPress serves says noindex', async ({ request }) => {
    const res = await request.get(api('/karamoja/v1/globals'));
    expect(res.headers()['x-robots-tag'] || '').toContain('noindex');
  });

  test('public content answers, without contact details', async ({ request }) => {
    for (const path of ['/karamoja/v1/globals', '/karamoja/v1/pages/home', '/karamoja/v1/pages/home?lang=sw', '/karamoja/v1/help', '/karamoja/v1/pwa']) {
      expect((await request.get(api(path))).status(), path).toBe(200);
    }
    const orgs = await (await request.get(api('/karamoja/v1/organizations?per_page=50'))).json();
    expect(Array.isArray(orgs)).toBe(true);
    for (const o of orgs) {
      // Contact details only inside `contact`, and only for organisations that chose to show them.
      expect(o, `organisation ${o.id}`).not.toHaveProperty('contact_email');
      expect(o, `organisation ${o.id}`).not.toHaveProperty('contact_phone');
    }
    const legacyOrgs = await request.get(api('/wp/v2/tk_organization'));
    if (legacyOrgs.ok()) expect(await legacyOrgs.text()).not.toMatch(/contact_email|contact_phone/);
  });

  test('active alerts are current', async ({ request }) => {
    const alerts = await (await request.get(api('/karamoja/v1/alerts?active=1&per_page=50'))).json();
    expect(Array.isArray(alerts)).toBe(true);
    for (const a of alerts) {
      expect(a.active, `alert ${a.id} "${a.title}"`).toBe(true);
      if (a.valid_to) expect(Date.parse(a.valid_to), `alert ${a.id} has ended`).toBeGreaterThan(Date.now());
    }
  });

  test('old tk/v1 addresses: marked for removal, not used by the website', async ({ request }) => {
    const res = await request.get(api('/tk/v1/push/subscriptions'));
    test.skip(res.status() === 404, 'no old addresses here (before cut-over they belong to the old plugins; later switched off)');
    if (res.status() === 410) return; // KARAMOJA_LEGACY_ROUTES = false
    expect([401, 403]).toContain(res.status());
    // After cut-over, Core answers them with a removal date and the new address.
    if (res.headers()['deprecation']) {
      expect(res.headers()['sunset']).toBeTruthy();
      expect(res.headers()['link'] || '').toContain('successor-version');
    }
  });

  test('push subscriptions need the shared secret', async ({ request }) => {
    for (const path of ['/karamoja/v1/push/subscriptions', '/tk/v1/push/subscriptions']) {
      const status = (await request.get(api(path))).status();
      if (status === 404 && path.startsWith('/tk/')) continue; // old address switched off
      expect([401, 403], path).toContain(status);
    }
  });
});
