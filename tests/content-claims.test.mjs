import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The hub has no SMS alerts and nothing on it is "real-time" (audit v3 N-16, help content WP-36). Website code must not
 * promise either, even in fallback text.
 */
const ROOTS = ['components', 'contexts', 'lib', 'pages'];
const BANNED = [/\bSMS\b/, /real[- ]time/i];

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p) : /\.(js|json)$/.test(name) ? [p] : [];
  });
}

describe('website copy', () => {
  it('makes no SMS or real-time claims', () => {
    const hits = [];
    ROOTS.flatMap((r) => files(r)).forEach((f) => {
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        if (BANNED.some((re) => re.test(line))) hits.push(`${f}:${i + 1}: ${line.trim().slice(0, 100)}`);
      });
    });
    expect(hits).toEqual([]);
  });
});
