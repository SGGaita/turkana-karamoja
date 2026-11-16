# Analytics and error monitoring (FE-27)

## Google Analytics 4

**Turn on:** Karamoja → Site settings → **Analytics** → *Google Analytics 4 measurement ID* (`G-…`) and the
*Privacy notice* link → Save. Empty ID = no analytics, no question, nothing loaded.

**Consent.** Visitors are asked first (`components/AnalyticsConsent.js`). Until they choose **Accept**, gtag.js is
not loaded and nothing is sent to Google (Consent Mode v2, "basic"): consent defaults to denied for
`analytics_storage`, `ad_storage`, `ad_user_data` and `ad_personalization`; Accept grants `analytics_storage` only.
Google signals and ad personalisation are off; ads data redaction is on.

- **Decline**, or a browser sending Global Privacy Control, keeps it off. The answer is kept in `localStorage`
  (`kc_consent`). Footer → **Analytics settings** asks again; declining after accepting removes the `_ga` cookies.
- Pages opened from password emails (`/partners-stakeholders/set-password`, `reset-password`, `forgot-password`)
  never start analytics: their address carries a one-time key.
- The install offer waits while the question is on screen.
- Texts: Karamoja → Interface text → group *Analytics question* (`consent.*`).

**In the GA4 data stream** (Admin → Data streams → the web stream → Enhanced measurement): keep *Page views*
(including "page changes based on browser history events": the site changes pages without reloading), and turn
**File downloads off** (the site sends its own `file_download` with the report and language).

### Events (`lib/analytics.js` → `track()`)

| Event | When | Parameters |
|---|---|---|
| page_view | Every page (GA4 enhanced measurement) | — ; user property `site_language` (en, sw, pko, tuv) |
| `file_download` | A report document is downloaded | `file_name`, `file_extension`, `report_id`, `file_language` |
| `install_prompt_shown` | The install offer appears | `source` (auto, button, …), `platform` (browser, ios) |
| `install_prompt_accepted` / `install_prompt_dismissed` | The visitor's choice | `source`, `platform`, `step` |
| `app_installed` | The browser reports the app installed | — |
| `push_subscribe` / `push_unsubscribe` | Alert notifications turned on / off | — |
| `offline_save` | Content saved for offline use | `mode` (button, auto), `items`, `failed` |
| `offline_document_save` | A report document saved for offline use | `file_name` |

Every event is also dispatched in the page as a `kc-analytics` event (with or without consent), for tests and for
another tool later.

Analytics counts are lower than real use (visitors who decline or block Google are not counted). Report download
totals in wp-admin count everyone.

## Looker Studio

1. GA4 → Admin → **Custom definitions** → create:
   - event-scoped dimensions `report_id`, `file_language`, `source`, `mode`, `platform`;
   - user-scoped dimension `site_language`.
   They collect data from the moment they exist (not backwards).
2. [Looker Studio](https://lookerstudio.google.com) → **Create → Data source → Google Analytics** → the hub's
   account and property → **Connect**.
3. **Create → Report** from that data source. Suggested pages:
   - *Visitors*: users and views per week; by country; by `site_language`; by device category.
   - *Content*: views by page path (one row per language address, e.g. `/reports` and `/sw/reports`).
   - *Reports*: `file_download` event count by `report_id` and `file_language` (filter: event name =
     `file_download`).
   - *App and alerts*: `app_installed`, `install_prompt_accepted`, `push_subscribe`, `offline_save` per week.
4. Share the report from Looker Studio (viewers need no Google Analytics or wp-admin access). Staff steps are also in
   the CMS: Karamoja → Help → *Website analytics and Looker Studio*.

## Error monitoring (Sentry)

Off unless `NEXT_PUBLIC_SENTRY_DSN` is set (Vercel → Settings → Environment Variables; rebuild after setting it).

1. Create a Sentry project (platform: *Next.js* or *Browser JavaScript*; either works) and copy its **DSN**.
2. Set `NEXT_PUBLIC_SENTRY_DSN` on Vercel (Production, and Preview if wanted). Optional:
   `NEXT_PUBLIC_SENTRY_ENVIRONMENT` (defaults to Vercel's `production` / `preview`).
3. In Sentry → Alerts, add a rule such as "a new issue is created → email the tech team".

What is reported:

- **Browser** (`lib/monitoring.js`): uncaught errors and rejected promises. The SDK (errors only, ~34 KB compressed)
  loads once the page has settled; errors from before that are kept and sent. No tracing, session replay or session
  counting.
- **Server** (`instrumentation.js` → `lib/monitoring-server.js`): errors in pages and API routes that nothing caught
  (Next.js `onRequestError`), with the route.

Browser reports go through this site's `/api/monitoring`, which forwards only to the configured project: no Sentry
host in the CSP, and ad-blockers don't drop them. **No personal data**: no user or IP (`sendDefaultPii: false`),
emails and phone numbers in messages are blanked, and addresses lose their query string (`lib/monitoring-shared.js`).

Release: the Git commit on Vercel (`NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`, if "Automatically expose System Environment
Variables" is on), otherwise the build ID. Source maps are not uploaded: stack traces show the built file names.
