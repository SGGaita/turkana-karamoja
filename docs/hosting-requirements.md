# Hosting Requirements — Karamoja Cluster (Frontend + Backend)

The platform is two separate services:

```
Next.js 15 website (Node, Vercel)  ←HTTPS/REST→  WordPress CMS with Karamoja Core (PHP + MySQL)
```

The **website cannot run on PHP-only shared hosting**. The CMS can.

Configuration values, secrets and deployment steps are in the deployment guide (`docs/deployment-guide.md`, kept
by the tech team). This page lists what the servers need.

---

## Website (Next.js)

A **Node process**, not a static site: pages are rebuilt on demand (ISR), and the `/api/*` routes keep the partner
session in an httpOnly cookie, forward portal calls to the CMS, receive "rebuild this page" calls from the CMS and
send push notifications. Push subscriptions are stored in WordPress, so the website needs no writable disk.

| Item | Needed |
|------|--------|
| Runtime | **Node.js 20** or later (`.nvmrc`; `package.json` `engines`) |
| Host | **Vercel** (current). Elsewhere: `npm run build` then `npm start` under PM2, systemd or Docker, behind HTTPS |
| CPU / RAM | 1 vCPU, 1 GB |
| TLS | HTTPS required (PWA, Web Push, secure cookies) |
| Outbound HTTPS | The CMS (REST API) and the browsers' push services (map tiles are loaded by visitors' browsers) |

Environment variables: see the deployment guide §4.1. Server-only secrets (`VAPID_PRIVATE_KEY`,
`PUSH_BROADCAST_SECRET`, `REVALIDATE_SECRET`, `CMS_PROXY_SECRET`) must never get a `NEXT_PUBLIC_` prefix.

### Not sufficient for the website

- Apache/Nginx serving only static HTML, or a static export (Netlify static, GitHub Pages)
- A PHP-only shared hosting plan

---

## CMS (WordPress + Karamoja Core)

Full notes, with the production `wp-config.php` sample, are in the CMS repository: `docs/hosting.md` and
`docs/wp-config-production.sample.php` in `SGGaita/karamoja-wp`. In short:

| Item | Needed |
|------|--------|
| WordPress | 6.6 or later (current: 7.1) |
| PHP | 7.4 or later; **use 8.3**. Extensions: `mysqli`, `mbstring`, `openssl`, `curl`, `fileinfo`, `gd` or `imagick`, `zip`, `xml`, `intl` |
| Database | MySQL 8.0 or MariaDB 10.6+, `utf8mb4` |
| Web server | Apache with `mod_rewrite` (cPanel) or Nginx; pretty permalinks |
| CPU / RAM / disk | 1–2 vCPU, 2 GB, 20 GB+ (uploads grow with reports) |
| HTTPS | Required |
| Cron | WordPress's scheduler run from the server every 5 minutes (`DISABLE_WP_CRON`) |
| Email | SMTP plugin + transactional mail provider; SPF, DKIM and DMARC on the sending domain |
| `Authorization` header | Passed through to PHP (one `.htaccess` line on Apache) |
| Outbound HTTPS | The website, `challenges.cloudflare.com`, `nominatim.openstreetmap.org`, the SMTP provider, WordPress updates |

Plugins: **Karamoja Core** (replaces the legacy `turkana-*` mu-plugins and TK Partner Portal at cut-over), JWT
Authentication for WP-API, WP Mail SMTP. The ACF plugin is not needed.

---

## Smallest layout

- **Website:** Vercel (or 1 vCPU / 1 GB with Node 20).
- **CMS:** cPanel or a VPS with 2 GB RAM, on its own hostname (e.g. `cms.`), HTTPS.
- Both on one VPS: 2 vCPU, 4 GB RAM, 40 GB SSD.
- Daily database and weekly `wp-content` backups, stored off the server.

## What you do not need

- Redis / object cache (useful later, not required)
- Elasticsearch
- A GPU
- Windows / XAMPP in production (XAMPP is local only)
