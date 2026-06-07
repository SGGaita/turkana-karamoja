# Connect Next.js to XAMPP WordPress (`turkana-karamoja-hub`)

## Locations

| App | Path | URL |
|-----|------|-----|
| **Next.js frontend** | `C:\projects\turkana-karamoja` | http://localhost:3000 |
| **WordPress CMS** | `C:\xampp\htdocs\turkana-karamoja-hub` | http://localhost/turkana-karamoja-hub |
| **WP Admin** | — | http://localhost/turkana-karamoja-hub/wp-admin |

## Already configured

1. **`.env.local`** in the Next project:
   ```bash
   NEXT_PUBLIC_WP_BASE_URL=http://localhost/turkana-karamoja-hub
   ```
2. **Must-use plugin** `wp-content/mu-plugins/turkana-headless-hub.php`:
   - Registers CPTs: `tk_alert`, `tk_report`, `tk_initiative`, `tk_organization`, `tk_programme`
   - Exposes `acf`-shaped fields in REST (matches `lib/wp-mappers.js`)
   - CORS for `http://localhost:3000`

Restart Next after changing env:
```powershell
cd C:\projects\turkana-karamoja
npm run dev
```

## XAMPP checklist

1. Start **Apache** and **MySQL** in XAMPP Control Panel.
2. Confirm WP loads: http://localhost/turkana-karamoja-hub
3. Log in to wp-admin once (seeds one sample RED alert).
4. **Settings → Permalinks** → choose **Post name** → Save (helps REST routes).

## Verify REST from PowerShell

```powershell
curl.exe "http://localhost/turkana-karamoja-hub/wp-json/wp/v2/tk_alert?status=publish&per_page=5"
```

You should see JSON with an `acf` object on each item.

## Submit advisory (JWT)

Install in WP: **JWT Authentication for WP REST API**, then create an **Editor** user.

On http://localhost:3000/submit → **Editor login** → submit creates a **draft** `tk_alert`.

## Home hero section

```
GET http://localhost/turkana-karamoja-hub/wp-json/tk/v1/hero
```

**Edit in wp-admin:** **Settings → Climate Hub Hero**

| Field | What it controls |
|-------|------------------|
| Eyebrow, title, subtitle | Main hero copy |
| Background image URL | Hero photo |
| Primary / secondary buttons | CTA labels and links |
| Overview panel title, subtitle, footer | “What’s happening now” widget |

Metrics and bottom quick-facts use defaults stored in WordPress (full JSON in option `tk_hub_hero`).

Home page revalidates every **120 seconds** — wait or restart `npm run dev` after saving.

## Header, logo & menu (Next.js navbar)

The navbar is loaded from WordPress on every page:

```
GET http://localhost/turkana-karamoja-hub/wp-json/tk/v1/site-header
```

**Edit in wp-admin:**

| What | Where |
|------|--------|
| Site title & tagline text | **Settings → Climate Hub Header** |
| Logo image | **Appearance → Customize → Site Identity → Logo** |
| Menu links | **Appearance → Menus** → assign to **Main Navigation (Next.js)** |

Use **Custom Links** with Next paths (e.g. `/early-warnings`, `/reports`), not full WordPress URLs.

Restart `npm run dev` after WP changes; refresh the browser.

## Adding content

In wp-admin you will see post types: Alerts, Reports, Initiatives, Organizations, Programmes.

Use **Custom Fields** panel (meta keys match integration doc):

| CPT | Example meta keys |
|-----|-------------------|
| `tk_alert` | `alert_level` (red/orange/yellow/green), `area`, `body`, `source`, `issued_date`, `valid_until`, `actions` (JSON) |
| `tk_report` | `tag`, `partner_orgs`, `file_url`, `file_size`, `publication_date` |

Or use the REST API / Next submit form.

## Production URL

When WordPress moves to a public host, update only:

```bash
NEXT_PUBLIC_WP_BASE_URL=https://your-production-wp.example
```

Add that origin to `TK_HUB_CORS_ORIGINS` in the mu-plugin (comma-separated).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Next shows “cached content” banner | Apache/MySQL off, wrong URL, or REST 404 — check permalink settings |
| CORS error in browser | Confirm mu-plugin exists; origin must be `http://localhost:3000` |
| Empty alerts list | Publish at least one `tk_alert` in wp-admin |
| Images from WP broken | Set `NEXT_PUBLIC_WP_BASE_URL` before `npm run dev` (Next uses it for `remotePatterns`) |
