# WordPress REST API Integration — Turkana-Karamoja Climate Hub

Integrate a headless WordPress CMS into the existing Next.js 15 site so all content (alerts, reports, initiatives, organizations, community programmes) is managed from the WordPress dashboard and fetched via the WP REST API.

---

## WordPress Setup (one-time, on your WP install)

### Plugins to install
| Plugin | Purpose |
|---|---|
| **Custom Post Type UI** | Register CPTs without code |
| **Advanced Custom Fields (ACF)** | Add custom meta fields to each CPT |
| **ACF to REST API** | Expose ACF fields in `/wp-json` responses |
| **WP CORS** (or custom headers) | Allow Next.js origin to query the API |
| **JWT Authentication for WP REST API** | Secure the Submit Advisory POST endpoint |

### Custom Post Types to create in CPT UI
| CPT Slug | Label | Fields (via ACF) |
|---|---|---|
| `tk_alert` | Alert | `alert_level` (RED/ORANGE/YELLOW/GREEN), `area`, `body`, `actions` (repeater), `source`, `issued_date`, `valid_until` |
| `tk_report` | Report/Document | `tag`, `partner_orgs`, `file_url`, `file_size`, `publication_date`, `is_new`, `is_updated` |
| `tk_initiative` | Initiative | `image_url`, `description` |
| `tk_organization` | Organization | `abbreviation`, `org_type`, `country_flag`, `portal_url` |
| `tk_programme` | Community Programme | `emoji_icon`, `description`, `languages` (repeater) |

> Standard WP `posts` will serve as **News / Bulletins** (tag taxonomy used for categorisation).

---

## Next.js Changes

### 1. Environment variable
Add `NEXT_PUBLIC_WP_BASE_URL` to `.env.local`:
```
NEXT_PUBLIC_WP_BASE_URL=http://your-wordpress-site.com
```

### 2. `lib/wordpress.js` — Central API client
A module with typed fetch helpers:
- `getAlerts()` — fetches `tk_alert` CPT
- `getReports()` — fetches `tk_report` CPT
- `getInitiatives()` — fetches `tk_initiative` CPT
- `getOrganizations()` — fetches `tk_organization` CPT
- `getProgrammes()` — fetches `tk_programme` CPT
- `getNewsPosts()` — fetches standard WP posts (news/bulletins)
- `submitAdvisory(data, token)` — POSTs a new draft `tk_alert` with JWT auth

### 3. Data fetching strategy per page
| Page | Method | Why |
|---|---|---|
| `/early-warnings` | `getServerSideProps` | Alerts are time-critical — always fresh |
| `/reports` | `getStaticProps` + `revalidate: 300` | Reports change infrequently |
| `/community` | `getStaticProps` + `revalidate: 600` | Programmes are stable |
| `/organizations` | `getStaticProps` + `revalidate: 3600` | Rarely changes |
| `index.js` landing page | `getStaticProps` + `revalidate: 120` | Mix of sections — balance freshness & speed |

### 4. `/pages/submit.js` — form → WP REST API POST
- Form submits to `POST /wp-json/wp/v2/tk_alert` with `status: draft`
- Requires JWT token (editor logs in via `/wp-json/jwt-auth/v1/token`)
- A simple login modal added to the submit page for authenticated editors

### 5. Loading & fallback states
- Skeleton placeholders shown while ISR re-validates
- Error boundary fallback if WP API is unreachable (show cached/static data with banner)

---

## Files to create / modify

| File | Action |
|---|---|
| `.env.local` | **Create** — WP base URL |
| `lib/wordpress.js` | **Create** — all API fetch helpers |
| `pages/early-warnings.js` | **Modify** — add `getServerSideProps` |
| `pages/reports.js` | **Modify** — add `getStaticProps` |
| `pages/community.js` | **Modify** — add `getStaticProps` |
| `pages/organizations.js` | **Modify** — add `getStaticProps` |
| `pages/submit.js` | **Modify** — form POSTs to WP API, add login modal |
| `pages/index.js` | **Modify** — add `getStaticProps` for landing sections |
| `components/SkeletonCard.js` | **Create** — MUI Skeleton loading placeholder |

---

## What stays the same
- All MUI components, flexbox layout, color theme — no visual changes
- Static/fallback data kept as defaults if WP is unreachable
- No TypeScript introduced

---

## Notes for WordPress admin
- All alerts start as `draft` when submitted via the form; an admin must publish them
- Images for initiatives/programmes should be set as the WP **Featured Image**
- The `alert_level` ACF field should use a Select field with values `red`, `orange`, `yellow`, `green`
