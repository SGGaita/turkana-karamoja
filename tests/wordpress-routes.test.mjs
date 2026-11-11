import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Public pages read Karamoja Core (karamoja/v1) only. The other WordPress routes the website may call are the ones Core
 * serves after cut-over (WP-39): partner portal, contact form, push subscriptions, download counting and the
 * partner's own uploads. The old content routes (tk/v1 hero, home-sections, site-header…) disappear at cut-over.
 */
const ROOTS = ['components', 'contexts', 'lib', 'pages', 'scripts'];
const ALLOWED = [
  'tk/v1/contact-submit',
  'tk/v1/register-organization',
  'tk/v1/organization-status',
  'tk/v1/my-submissions',
  'tk/v1/reports/', // download counting
  'tk/v1/push/subscriptions',
  'wp/v2/media',
  'wp/v2/tk_report',
  'wp/v2/tk_alert',
];

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p) : /\.js$/.test(name) ? [p] : [];
  });
}

describe('WordPress routes', () => {
  it('calls only Karamoja Core content routes and the routes Core serves at cut-over', () => {
    const hits = [];
    ROOTS.flatMap((r) => files(r)).forEach((f) => {
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        (line.match(/\b(?:tk\/v1|wp\/v2)\/[A-Za-z_/-]*/g) || []).forEach((route) => {
          if (!ALLOWED.some((ok) => route.startsWith(ok))) hits.push(`${f}:${i + 1}: ${route}`);
        });
      });
    });
    expect(hits).toEqual([]);
  });
});
