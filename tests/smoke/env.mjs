import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** A value from .env.local (the website's local settings), without loading anything else from it. */
function fromEnvLocal(key) {
  try {
    const text = readFileSync(fileURLToPath(new URL('../../.env.local', import.meta.url)), 'utf8');
    const line = text.split(/\r?\n/).find((l) => l.trim().startsWith(`${key}=`));
    return line ? line.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '') : '';
  } catch {
    return '';
  }
}

const strip = (u) => String(u || '').trim().replace(/\/+$/, '');
const flag = (v) => /^(1|true|yes)$/i.test(String(v || ''));

/** Smoke-check settings (tests/smoke/README.md). */
export function smokeEnv() {
  const site = strip(process.env.SMOKE_SITE) || 'http://localhost:3000';
  const cms = strip(process.env.SMOKE_CMS) || strip(process.env.NEXT_PUBLIC_WP_BASE_URL) || strip(fromEnvLocal('NEXT_PUBLIC_WP_BASE_URL'));
  return {
    site,
    cms,
    https: site.startsWith('https:'),
    // Production only: robots.txt allows, pages carry canonical + hreflang, /sitemap.xml answers.
    indexing: flag(process.env.SMOKE_EXPECT_INDEXING),
    // The captcha must show on the contact form (live sites; locally when the CMS has Turnstile keys).
    captcha: flag(process.env.SMOKE_EXPECT_CAPTCHA),
    // Map pictures come from CARTO / OpenStreetMap; skip where the network can't reach them.
    tiles: !flag(process.env.SMOKE_SKIP_TILES),
    // Other languages to open, if ticked ready in Site settings → Languages.
    locales: String(process.env.SMOKE_LOCALES ?? 'sw').split(',').map((s) => s.trim()).filter(Boolean),
    // A test partner account (never a real person's): sign in → dashboard → sign out. Nothing is submitted.
    partner: { user: process.env.SMOKE_PARTNER_USER || '', pass: process.env.SMOKE_PARTNER_PASSWORD || '' },
    ci: Boolean(process.env.CI),
  };
}
