# Turkana–Karamoja Climate Hub — Technical Documentation

Architecture, setup, API reference, and operational guidance for developers and system administrators.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Project Structure](#project-structure)
3. [Environment Variables](#environment-variables)
4. [Local Development Setup](#local-development-setup)
5. [API Reference — Public Read Endpoints](#api-reference--public-read-endpoints)
6. [API Reference — Public Write Endpoints](#api-reference--public-write-endpoints)
7. [API Reference — Authenticated Endpoints (JWT)](#api-reference--authenticated-endpoints-jwt)
8. [Next.js API Routes](#nextjs-api-routes)
9. [Frontend Data Fetching Strategy](#frontend-data-fetching-strategy)
10. [Authentication Flow](#authentication-flow)
11. [WordPress Plugin Deployment](#wordpress-plugin-deployment)
12. [Production Deployment](#production-deployment)
13. [PWA & Push Notifications](#pwa--push-notifications)
14. [Troubleshooting](#troubleshooting)

---

## System Architecture

The Turkana–Karamoja Climate Hub uses a headless architecture: a Next.js 15 frontend (React, MUI) communicates with a WordPress REST API backend over HTTP. Content is stored in MySQL via WordPress; the frontend renders pages using static generation, server-side rendering, and client-side fetching with offline fallback data.

### Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 15 (Pages Router) at `c:\projects\karamoja-cluster-fe` |
| Backend | WordPress on XAMPP at `C:\xampp\htdocs\karamoja-cluster-fe` |
| Communication | WordPress REST API (`/wp-json/`) + custom TK endpoints (`/wp-json/tk/v1/`) |
| Authentication | JWT tokens (JWT Authentication for WP REST API plugin) |
| Maps | Leaflet + react-leaflet |
| PWA | `@ducanh2912/next-pwa` with Workbox service worker |
| Push notifications | web-push via Next.js API routes |

### Architecture Diagram

```
┌─────────────────────┐         HTTP/REST          ┌─────────────────────┐
│   Next.js Frontend  │ ◄────────────────────────► │  WordPress Backend  │
│   (React, MUI)      │    /wp-json/ + /tk/v1/     │  (MySQL, ACF, CPT)  │
│   localhost:3000    │                            │  XAMPP Apache       │
└─────────────────────┘                            └─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  PWA Service Worker │
│  (offline cache)    │
└─────────────────────┘
```

---

## Project Structure

| Path | Description |
|------|-------------|
| `pages/` | Next.js routes — one file per page |
| `components/` | React UI components (Layout, Navbar, forms, maps) |
| `lib/wordpress.js` | WordPress API client with fallback support |
| `lib/wp-mappers.js` | Transform WP REST responses to frontend data shapes |
| `lib/fallback-data.js` | Static content when WordPress is unreachable |
| `lib/org-session.js` | JWT session storage (sessionStorage) |
| `contexts/SiteHeaderContext.js` | Global nav/branding state |
| `wordpress-plugin/tk-partner-portal/` | Partner portal WordPress plugin source |
| `planning/` | Setup checklists and integration specs |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_WP_BASE_URL` | Yes (prod) | WordPress site URL, e.g. `http://localhost/karamoja-cluster-fe` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push only | Web Push VAPID public key |
| `VAPID_PRIVATE_KEY` | Push only | Web Push VAPID private key (server-side) |
| `VAPID_SUBJECT` | Push only | `mailto:` contact for push service |
| `PUSH_BROADCAST_SECRET` | Push only | Secret for `POST /api/push/broadcast` |

### Example `.env.local`

```bash
NEXT_PUBLIC_WP_BASE_URL=http://localhost/karamoja-cluster-fe
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:admin@tkclimate.org
PUSH_BROADCAST_SECRET=your-secret
```

---

## Local Development Setup

1. Install Node.js 18+ and run `npm install` in the frontend repo.
2. Start XAMPP (Apache + MySQL) and ensure WordPress is accessible.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_WP_BASE_URL`.
4. Activate required WordPress plugins (see [Backend & Admin Guide](./user-guide-backend.md)).
5. Run `npm run dev` — frontend starts at `http://localhost:3000`.
6. Configure CORS on WordPress to allow `http://localhost:3000` with `Authorization` header.

> **Note:** When `NEXT_PUBLIC_WP_BASE_URL` is unset, the frontend uses `fallback-data.js` static content and shows an offline/stale indicator.

---

## API Reference — Public Read Endpoints

These endpoints require no authentication. Replace `BASE` with your WordPress URL.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wp-json/wp/v2/tk_alert?status=publish` | Published advisories |
| GET | `/wp-json/wp/v2/tk_report?status=publish` | Published reports |
| GET | `/wp-json/wp/v2/tk_initiative?status=publish` | Initiatives |
| GET | `/wp-json/wp/v2/tk_programme?status=publish` | Community programmes |
| GET | `/wp-json/wp/v2/tk_organization?status=publish` | Organisations |
| GET | `/wp-json/wp/v2/posts?status=publish` | News and bulletins |
| GET | `/wp-json/wp/v2/pages?slug=about` | About page content |
| GET | `/wp-json/tk/v1/site-header` | Navigation and branding |
| GET | `/wp-json/tk/v1/hero` | Homepage hero content |
| GET | `/wp-json/tk/v1/contact` | Contact page data |
| GET | `/wp-json/tk/v1/organizations/{id}` | Organisation profile with related content |

---

## API Reference — Public Write Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/wp-json/tk/v1/contact-submit` | Contact form submission |
| POST | `/wp-json/tk/v1/register-organization` | Organisation registration |
| GET | `/wp-json/tk/v1/organization-status?email=` | Check registration status |

### Example: Register Organisation

```bash
curl -X POST "BASE/wp-json/tk/v1/register-organization" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test NGO","contact_name":"Jane","contact_email":"jane@example.com","org_type":"NGO","country":"KE"}'
```

---

## API Reference — Authenticated Endpoints (JWT)

Obtain a token via `POST /wp-json/jwt-auth/v1/token`, then pass `Authorization: Bearer TOKEN` on all requests.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/wp-json/jwt-auth/v1/token` | Login — returns JWT token |
| POST | `/wp-json/wp/v2/media` | Upload file attachment |
| POST | `/wp-json/wp/v2/tk_alert` | Submit advisory (forced to pending) |
| POST | `/wp-json/wp/v2/tk_report` | Submit report (forced to pending) |
| GET | `/wp-json/tk/v1/my-submissions` | List own submissions |
| PATCH | `/wp-json/tk/v1/my-submissions/{type}/{id}` | Update submission |
| POST | `/wp-json/tk/v1/my-submissions/{type}/{id}/withdraw` | Withdraw submission |
| POST | `/wp-json/tk/v1/my-submissions/report/{id}/documents` | Add report documents |
| DELETE | `/wp-json/tk/v1/my-submissions/report/{id}/documents` | Remove report document |

### Example: Login and List Submissions

```bash
# Login
curl -X POST "BASE/wp-json/jwt-auth/v1/token" \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","password":"PASSWORD"}'

# List submissions
curl "BASE/wp-json/tk/v1/my-submissions" \
  -H "Authorization: Bearer TOKEN"
```

---

## Next.js API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/push/subscribe` | POST | Store browser push subscription |
| `/api/push/broadcast` | POST | Send push notification (requires `PUSH_BROADCAST_SECRET`) |

---

## Frontend Data Fetching Strategy

| Page | Strategy | Notes |
|------|----------|-------|
| `/` | `getStaticProps` + ISR | Homepage with revalidation |
| `/early-warnings` | `getServerSideProps` | Always fresh alerts |
| `/early-warnings/[slug]` | `getStaticPaths` + `getStaticProps` | Individual advisory pages |
| `/reports` | Client-side (`useEffect`) | Dynamic search and filtering |
| `/partners-stakeholders` | Client-only | Auth state in sessionStorage |
| `/help/*` | Static | Documentation pages |

> **Note:** All fetchers in `lib/wordpress.js` use `fetchWithFallback()` — if WordPress is down, static fallback data is served and the `apiStale` flag is set.

---

## Authentication Flow

1. Organisation registers via `POST /tk/v1/register-organization` (public).
2. Admin approves in wp-admin → WordPress user created → password setup email sent.
3. Partner logs in via `POST /jwt-auth/v1/token` from the frontend.
4. JWT stored in sessionStorage (`tk_hub_jwt`, `tk_hub_user_email`, `tk_hub_org`).
5. Authenticated requests include `Authorization: Bearer` header.
6. Logout clears sessionStorage keys.

> **Note:** Demo mode: when WordPress is not configured, `partners-stakeholders.js` accepts demo credentials for UI testing.

---

## WordPress Plugin Deployment

1. Copy `wordpress-plugin/tk-partner-portal/` to `wp-content/plugins/tk-partner-portal/`.
2. Copy mu-plugins from `wordpress-plugin/tk-partner-portal/mu-plugins-live/` to `wp-content/mu-plugins/`.
3. Activate **TK Partner Portal** in wp-admin → Plugins.
4. Install and configure JWT Authentication plugin with secret in `wp-config.php`.
5. Flush permalinks (**Settings → Permalinks → Save**).

---

## Production Deployment

- **Frontend:** Build with `npm run build`, deploy `.next` output to Node.js host or Vercel/Netlify.
- Set `NEXT_PUBLIC_WP_BASE_URL` to production WordPress URL.
- **WordPress:** Deploy to production server with HTTPS, configure CORS for frontend domain.
- Ensure JWT secret, database credentials, and push secrets are in environment variables — never in source code.
- Configure WordPress mail (SMTP) for organisation approval emails.
- Set up regular database and media backups.

---

## PWA & Push Notifications

- PWA configured in `next.config.js` via `@ducanh2912/next-pwa`.
- Service worker caches WordPress API responses for offline access.
- Generate VAPID keys: `npx web-push generate-vapid-keys`
- Push subscriptions stored in `data/push-subscriptions.json`.
- Broadcast via `POST /api/push/broadcast` with `PUSH_BROADCAST_SECRET` header.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| REST API returns 404 | Flush permalinks; verify plugin is active |
| CORS errors in browser | Add frontend origin to WP CORS config with Authorization header |
| JWT login fails | Verify JWT secret in `wp-config.php`; check plugin is active |
| Reports missing description | Add ACF description field; enable Excerpt on `tk_report` CPT |
| Help link goes nowhere | Update Site Header Help href to `/help` in wp-admin |
| Frontend shows stale data | Check `NEXT_PUBLIC_WP_BASE_URL`; verify WP is reachable |

---

## Related Documentation

- [Frontend User Guide](./user-guide-frontend.md) — Public website and partner portal usage
- [Backend & Admin Guide](./user-guide-backend.md) — WordPress administration and content publishing
