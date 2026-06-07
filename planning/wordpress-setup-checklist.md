# WordPress Setup Checklist — Turkana–Karamoja Climate Hub

Operator-facing steps to complete **before** the Next.js site can load live CMS content.

---

## 1. Plugins

| Plugin | Purpose |
|--------|---------|
| Custom Post Type UI | Register CPTs |
| Advanced Custom Fields (ACF) | Meta fields per CPT |
| ACF to REST API | Expose `acf` in `/wp-json` responses |
| WP CORS (or `functions.php` headers) | Allow Next.js origin |
| JWT Authentication for WP REST API | Editor login + advisory POST |

---

## 2. Custom post types (CPT UI)

| Slug | Label | REST base |
|------|-------|-----------|
| `tk_alert` | Alert | `/wp/v2/tk_alert` |
| `tk_report` | Report/Document | `/wp/v2/tk_report` |
| `tk_initiative` | Initiative | `/wp/v2/tk_initiative` |
| `tk_organization` | Organization | `/wp/v2/tk_organization` |
| `tk_programme` | Community Programme | `/wp/v2/tk_programme` |

Standard **Posts** + **Tags** → news / bulletins (`/wp/v2/posts`).

---

## 3. ACF field groups

### `tk_alert`
| Field | Type | Notes |
|-------|------|-------|
| `alert_level` | Select | `red`, `orange`, `yellow`, `green` |
| `area` | Text | Geographic scope |
| `body` | Textarea | Full advisory text |
| `actions` | Repeater (text) | Recommended actions |
| `source` | Text | Issuing agency |
| `issued_date` | Date/time | |
| `valid_until` | Text | Display string OK |

### `tk_report`
| Field | Type |
|-------|------|
| `tag` | Text |
| `partner_orgs` | Text (comma-separated) |
| `file_url` | URL |
| `file_size` | Text |
| `publication_date` | Date |
| `is_new` | True/false |
| `is_updated` | True/false |

### `tk_initiative`
| Field | Type |
|-------|------|
| `tag` | Text (optional) |
| `tag_color` | Text (optional hex) |
| `description` | Textarea |
| `image_url` | URL (fallback if no featured image) |

### `tk_organization`
| Field | Type |
|-------|------|
| `abbreviation` | Text |
| `org_type` | Text |
| `country_flag` | Text (emoji) |
| `portal_url` | URL |

### `tk_programme`
| Field | Type |
|-------|------|
| `emoji_icon` | Text |
| `description` | Textarea |
| `languages` | Repeater or comma-separated text |
| `color` | Text (hex, optional) |

Set **Featured Image** on initiatives and programmes where possible.

---

## 4. REST verification

Run these against your WP host (replace base URL):

```bash
curl "https://YOUR-WP-SITE/wp-json/wp/v2/tk_alert?status=publish&per_page=5&_embed"
curl "https://YOUR-WP-SITE/wp-json/wp/v2/tk_report?per_page=5"
curl "https://YOUR-WP-SITE/wp-json/wp/v2/posts?per_page=5&_embed"
```

Confirm each published item includes an `acf` object with the fields above.

---

## 5. CORS

Allow origins:

- `http://localhost:3000` (development)
- Production Next.js URL (e.g. `https://climate.turkana.go.ke`)

Headers must include `Authorization` for JWT POST from `/submit`.

Example (`functions.php`):

```php
add_action('rest_api_init', function () {
  remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
  add_filter('rest_pre_serve_request', function ($value) {
    header('Access-Control-Allow-Origin: https://your-next-site.example');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Authorization, Content-Type');
    return $value;
  });
}, 15);
```

---

## 6. Editor accounts

Create WordPress users with **Editor** (or custom) role for:

- Government climate / disaster agencies (Kenya & Uganda)
- DRC staff testers

Test JWT:

```bash
curl -X POST "https://YOUR-WP-SITE/wp-json/jwt-auth/v1/token" \
  -H "Content-Type: application/json" \
  -d '{"username":"editor","password":"***"}'
```

---

## 7. Next.js environment

Copy `.env.example` → `.env.local`:

```bash
NEXT_PUBLIC_WP_BASE_URL=https://your-wp-site.example
```

Rebuild or restart `npm run dev` after changing env vars.

---

## 8. Web Push (optional, recommended)

### VAPID keys

```bash
npx web-push generate-vapid-keys
```

Add to `.env.local`:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@example.org
PUSH_BROADCAST_SECRET=your-random-secret
```

### WordPress webhook on publish

On `publish_tk_alert`, POST to Next.js:

```
POST https://YOUR-NEXT-SITE/api/push/broadcast
Header: x-push-secret: <PUSH_BROADCAST_SECRET>
Body: { "title": "...", "body": "...", "url": "/early-warnings" }
```

Or trigger manually in dev with the same request.

**Scope:** Browser push for new published alerts only — not a replacement for SMS/radio EWS channels.

---

## 9. Phase 2 (not in current WP spec)

| Item | Notes |
|------|-------|
| 7-day forecast strip | External met API or WP options page |
| Regional map stations | GeoJSON / WP options |
| Seasonal outlook block | WP options or ICPAC feed |
| Reports funding stats | WP options or static until defined |

---

## 10. Deferred TOR items

| Requirement | Next phase |
|-------------|------------|
| Turkana / Pokot / Moroto clones | `NEXT_PUBLIC_SITE_ID` + branding pack |
| Google Looker Studio | GTM + GA4 per instance |
| Pen test, backups, uptime | Hosting contract + monitors |
| Full SEO program | Metadata + sitemap after CMS live |
| i18n (en/sw/tkn/kj) | After content API stable |

---

*Complete sections 1–7 before go-live content editing. Section 8 before enabling push in production.*
