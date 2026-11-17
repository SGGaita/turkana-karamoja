# Smoke checks and Lighthouse (FE-28)

Run these after every deployment, after a cut-over, and before launch. They only **look**: no form is sent and
nothing is changed in the CMS. Run them against a production build (`npm run build && npm start`) or a live site,
never `npm run dev`.

## Smoke checks: `npm run test:smoke`

```bash
npm run test:smoke                       # website http://localhost:3000, CMS from .env.local
SMOKE_SITE=https://www.example.org SMOKE_CMS=https://cms.example.org SMOKE_EXPECT_INDEXING=1 SMOKE_EXPECT_CAPTCHA=1 npm run test:smoke
```

Report: `playwright-report/smoke/index.html` (`npx playwright show-report playwright-report/smoke`).

| Setting | Default | What it does |
|---|---|---|
| `SMOKE_SITE` | `http://localhost:3000` | The website |
| `SMOKE_CMS` | `NEXT_PUBLIC_WP_BASE_URL` (environment or `.env.local`) | The CMS. Without it the CMS checks are skipped |
| `SMOKE_EXPECT_INDEXING` | off | **Production only.** Expect `robots.txt` to allow, a canonical link, hreflang and `/sitemap.xml`. Off: expect *noindex* (sandbox, previews, local) |
| `SMOKE_EXPECT_CAPTCHA` | off | Expect the Turnstile captcha on the contact form (live sites; locally when the CMS has Turnstile keys) |
| `SMOKE_LOCALES` | `sw` | Other languages to open (comma-separated). A language not ticked ready in Site settings is skipped |
| `SMOKE_SKIP_TILES` | off | Skip the map-picture checks (only where the network can't reach CARTO / OpenStreetMap) |
| `SMOKE_PARTNER_USER`, `SMOKE_PARTNER_PASSWORD` | — | A **test** partner account, never a real person's: sign in → dashboard → sign out. Without them the check is skipped |
| `PW_CHROME_PATH` / `PW_CHANNEL` | Playwright's Chromium | Use an installed Chrome |

What it covers (deployment guide §9):

- **Every page** in `lib/offline-config.js` and one alert, report, organisation and help article: answers, has its
  heading, not *can't be shown just now*, no script errors, no blocked requests (CSP), no React/hydration errors, and
  never wider than the screen. On a 1280 px desktop and a Pixel 7.
- **Languages**: `/sw/…` pages carry `<html lang="sw">`.
- **Maps**: every map shows its map pictures, also on the second visit through the service worker (the grey maps of
  17 Nov 2026); `/sw.js` allows the tile servers in `connect-src`; active pinned advisories are on the Early warnings map.
- **Security headers**, indexing as expected, old addresses redirect (`/contact-us`, `/help/admin-guide`, `/help/technical`),
  no *API Access* link.
- **Installed app**: manifest, a 512 px icon, and Chrome's own installability check (no errors).
- **Forms**: the contact form and its captcha are there (not sent); partner sign-in with a test account keeps the
  session in an httpOnly cookie.
- **Accessibility** (`a11y.spec.mjs`, axe — the engine behind Lighthouse's accessibility score): every page and `/sw`,
  WCAG 2.2 A/AA, failing on serious and critical problems — text too faint for its real background, buttons, links
  and map dots without a name, form fields without a label, controls smaller than 24 px. Map dots are left out of the
  tap-size rule only (neighbouring places can overlap at the starting zoom).
- **CMS, signed out**: users list, page schema and staff help refused; `?author=` 404; XML-RPC off; no `readme.html`,
  `license.txt`, `debug.log` or repository files (`wp-content/.git`, `ops`, `docs`, `composer.json`); *noindex* header; public content answers without contact details; active alerts are
  current; old `tk/v1` addresses marked for removal (Deprecation / Sunset / successor) or switched off; push
  subscriptions need the shared secret.

Still by hand (they send email or change content): the partner submission → *Waiting for review* → approval → push
notification round, registration, *Forgot your password?* (§7.2c step D).

## Lighthouse: `npm run test:lighthouse`

```bash
npm run test:lighthouse                                   # phone settings
LH_DESKTOP=1 npm run test:lighthouse                      # desktop
SMOKE_SITE=https://www.example.org LH_MIN="accessibility=90,best-practices=90,seo=90" npm run test:lighthouse
```

Saves `reports/lighthouse/<date>-<host>-<mobile|desktop>.md` (commit it: that is the record over time) and the full
reports in `reports/lighthouse/html/` (not committed). `LH_PAGES=/,/reports` picks pages; `LH_MIN` makes it fail below
the given scores. Lighthouse 12 has no PWA category: installability is in the smoke checks above.

Local and sandbox sites have indexing off, so SEO loses points for *noindex*; only production SEO scores count. Local
performance is a guide only: the live site runs on Vercel's CDN.

## On real phones (FE-28: once before launch, then after big releases)

On an Android phone (Chrome) and an iPhone (Safari), on the live site:

1. Open the home page, Early warnings and Reports; wait until the footer says the site is saved for offline use
   (or tap **Download for offline use**).
2. Install: Android **Install app**; iPhone Share → **Add to Home Screen** (the site shows the steps).
3. Turn on airplane mode, open the installed app: home, Early warnings, Reports and Help open with the *You're offline*
   bar; a page never opened shows the offline page with the helplines; a saved report document opens.
4. Back online: the bar goes; pull to refresh shows current content.
5. Note the phone, browser version, date and result in the deployment guide's change log.
