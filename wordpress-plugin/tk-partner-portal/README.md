# TK Partner Portal (WordPress plugin)

Backs the Next.js `/partners-stakeholders` page (organisation registration, sign-in, and the
Overview / Submit Advisory / Submit Report sections) with the custom REST
endpoints `lib/wordpress.js` already calls, which are **not** part of standard
WordPress or the CPT/ACF setup in `planning/wordpress-setup-checklist.md`:

- `POST /wp-json/tk/v1/register-organization`
- `GET  /wp-json/tk/v1/organization-status?email=...`
- `GET  /wp-json/tk/v1/my-submissions`
- `PATCH /wp-json/tk/v1/my-submissions/{advisory|report}/{id}`
- `POST /wp-json/tk/v1/my-submissions/{advisory|report}/{id}/withdraw`
- `POST /wp-json/tk/v1/my-submissions/report/{id}/documents`

It also adds an organisation approve/reject workflow in wp-admin (with automatic
partner-account creation + password-setup email on approval), and forces every
new advisory/report submitted through the portal into WordPress's built-in
**Pending Review** queue, regardless of what status the client sends.

## Install (local XAMPP)

1. Copy this folder to `C:\xampp\htdocs\turkana-karamoja-hub\wp-content\plugins\tk-partner-portal`
   (i.e. the whole `tk-partner-portal` directory, containing `tk-partner-portal.php`).
2. In wp-admin → Plugins, activate **TK Partner Portal**.
3. Confirm you already have (per `planning/wordpress-setup-checklist.md`):
   - **JWT Authentication for WP REST API** plugin active, with the JWT secret key
     set in `wp-config.php` — required so `Authorization: Bearer <token>` resolves
     `is_user_logged_in()` inside these routes.
   - CORS allowing `http://localhost:3000` (dev) including the `Authorization` header.
4. If `tk_organization`, `tk_alert`, or `tk_report` aren't already registered via
   Custom Post Type UI, this plugin registers minimal fallback versions itself on
   activation, so the endpoints work either way.

No ACF or ACF-to-REST-API dependency — this plugin reads/writes the same meta keys
those tools would use, directly via `get_post_meta`/`update_post_meta`.

## Verify it's working

Replace `EMAIL`, `PASSWORD`, `TOKEN` below with real values. Run from any shell —
these hit your XAMPP site, not this repo.

```bash
# 1. Register an organisation (public, no auth)
curl -X POST "http://localhost/turkana-karamoja-hub/wp-json/tk/v1/register-organization" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test NGO","contact_name":"Jane Doe","contact_email":"jane@example.com","org_type":"NGO","country":"KE"}'
# → { "message": "...", "reference": "TK-ORG-000012", "id": 12 }

# 2. Check status (public)
curl "http://localhost/turkana-karamoja-hub/wp-json/tk/v1/organization-status?email=jane@example.com"
# → { "registered": true, "status": "pending", "approved": false, ... }

# 3. In wp-admin → Organizations, click "Approve" on the new entry.
#    Jane gets a "set your password" email (check the site's mail log / Mailhog / MailPipe
#    if XAMPP isn't configured to send real mail).

# 4. Get a JWT once Jane has a password
curl -X POST "http://localhost/turkana-karamoja-hub/wp-json/jwt-auth/v1/token" \
  -H "Content-Type: application/json" \
  -d '{"username":"jane@example.com","password":"PASSWORD"}'
# → { "token": "..." }

# 5. List her submissions (auth)
curl "http://localhost/turkana-karamoja-hub/wp-json/tk/v1/my-submissions" \
  -H "Authorization: Bearer TOKEN"
# → { "items": [...] }
```

If step 1 or 2 return a 404 "No route" error, the plugin isn't active or the
permalinks need flushing (Settings → Permalinks → Save in wp-admin, no changes needed).

## What this plugin intentionally does NOT do

- It does not create the `tk_alert` / `tk_report` posts themselves — those still go
  through the existing `POST /wp/v2/tk_alert` and `POST /wp/v2/tk_report` routes from
  `lib/wordpress.js`'s `submitAdvisory` / `submitReport`, same as before. This plugin
  only intercepts them to force `pending` status and stamp ownership/reference meta.
- It does not implement hard delete — only withdraw (soft retract, keeps the audit
  trail) per the current portal design.
