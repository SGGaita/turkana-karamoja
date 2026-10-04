# Hosting Requirements — Karamoja Cluster (Frontend + Backend)

Minimum and practical production requirements to host this application. The platform is two separate services; they can run on one VPS.

```
Next.js 15 (Node)  ←HTTPS/REST→  WordPress 7.1 (PHP + MySQL)
```

The **frontend cannot run on PHP-only shared hosting**. WordPress can.

---

## Frontend (Next.js)

This is a **Node process**, not a static site. It uses `getServerSideProps` (early warnings), ISR, and `/api/push/*` routes that write `data/push-subscriptions.json`.

| Item | Minimum | Practical production |
|------|---------|----------------------|
| Runtime | **Node.js 18.18+** (project docs say 18+) | Node **20 LTS** |
| Process | `npm run build` then `next start` | PM2, systemd, Docker, or Vercel |
| CPU / RAM | 1 vCPU, **512 MB** | **1 vCPU, 1 GB** |
| Disk | ~2 GB for app + `node_modules` | **5–10 GB** (writable `data/` for push) |
| TLS | HTTPS | Required for PWA and Web Push |
| Outbound HTTPS | Yes | Must reach WordPress REST + CARTO tiles |

### Required environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_WP_BASE_URL` | Yes | Public WordPress URL |
| `NEXT_PUBLIC_CARTO_API_KEY` | Yes (maps) | Leaflet/CARTO basemaps; without it, tiles show a watermark |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push only | Web Push VAPID public key |
| `VAPID_PRIVATE_KEY` | Push only | Web Push VAPID private key (server-side) |
| `VAPID_SUBJECT` | Push only | `mailto:` contact for the push service |
| `PUSH_BROADCAST_SECRET` | Push only | Secret for `POST /api/push/broadcast` (must match `TK_HUB_PUSH_SECRET` in WordPress) |

### Not sufficient for the frontend

- Apache/Nginx serving only static HTML
- Netlify (or similar) static export
- A PHP-only shared hosting plan

---

## Backend (WordPress CMS)

The current install is **WordPress 7.1**. Core’s own floor is PHP **7.4** and MySQL **5.5.5**. The JWT plugin also requires PHP **7.4+**. Use newer versions in production.

| Item | Minimum | Practical production |
|------|---------|----------------------|
| PHP | **7.4** | **8.2 or 8.3** |
| Database | MySQL 5.5.5 | **MySQL 8.0** or **MariaDB 10.6+**, utf8mb4 |
| Web server | Apache or Nginx + PHP-FPM | Apache with `mod_rewrite`, or Nginx rewrites |
| CPU / RAM | 1 vCPU, **1 GB** | **1–2 vCPU, 2 GB** |
| Disk | ~2 GB for core | **20 GB+** (`wp-content/uploads` grows with reports/PDFs) |
| TLS | HTTPS | Required if the frontend is HTTPS |

### PHP extensions

**Required by WordPress:** `json`, `hash`

**Also enable:** `mysqli`, `openssl`, `curl`, `mbstring`, `gd` (or Imagick), `zip`, `xml`, `fileinfo`

### Host configuration that must work

- Pretty permalinks (`mod_rewrite` or equivalent) so `/wp-json/` works
- `Authorization` header passed through (JWT). On Apache this usually needs an `.htaccess` rewrite so the header is not stripped
- Writable `wp-content/uploads`
- Outbound email (SMTP). Organisation approval, password setup, and the contact form use `wp_mail()`
- CORS: the production frontend origin must be added to `TK_HUB_CORS_ORIGINS` (local default is only `localhost:3000`)

### Plugins / must-use plugins

| Plugin | Purpose |
|--------|---------|
| JWT Authentication for WP REST API | Partner login; set `JWT_AUTH_SECRET_KEY` in `wp-config.php` |
| TK Partner Portal | Organisation registration, approval, submissions |
| mu-plugins (`turkana-headless-hub.php` and related) | CPTs, REST meta, CORS, hub settings |
| Advanced Custom Fields (ACF) | Structured meta fields (recommended) |
| ACF to REST API | Expose ACF fields on `/wp-json` (recommended) |

ACF is recommended for structured fields. The custom plugin can run without it.

---

## Smallest production layout that actually works

### One VPS (both apps)

- **2 vCPU, 4 GB RAM, 40 GB SSD**
- Node for Next.js; Apache/Nginx + PHP-FPM + MySQL for WordPress
- Two hostnames, e.g. `www.` and `cms.` / `wp.`, both HTTPS
- Automated backups of MySQL and `wp-content/uploads`

**Absolute floor for a quiet site:** one **2 GB RAM** VPS can run both, but it will be tight once media uploads and concurrent users appear. **2 GB is the realistic combined minimum; 4 GB is the comfortable minimum.**

---

## What you do not need

- Redis / object cache (useful later, not required)
- Elasticsearch
- A GPU
- Windows / XAMPP in production (XAMPP is local only)

---

## Related documentation

- [Technical documentation](./technical-documentation.md) — architecture, env vars, deployment notes
- [Backend & admin guide](./user-guide-backend.md) — plugins, CPTs, CMS operations
- [WordPress setup checklist](../planning/wordpress-setup-checklist.md)
- [Local XAMPP setup](../planning/wp-local-xampp-setup.md)
