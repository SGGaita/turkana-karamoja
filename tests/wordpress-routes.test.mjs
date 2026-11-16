import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The website calls Karamoja Core's karamoja/v1 only (WP-39), plus three WordPress routes for the partner's own
 * submissions and uploads. The old plugin's addresses (the old namespace) are answered by Core for 90 days after
 * cut-over, then removed: nothing here may call them.
 */
const ROOTS = ['components', 'contexts', 'lib', 'pages', 'scripts'];
const ALLOWED = [
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
  it('calls no old tk/v1 address, and only the wp/v2 routes for submissions and uploads', () => {
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
