# Turkana–Karamoja Climate Hub — Documentation Index

This folder contains the canonical documentation for the Climate Hub platform. The same content is rendered in the web application at `/help`.

## Documentation Structure

| Document | Audience | Web Route |
|----------|----------|-----------|
| [User Guide](./user-guide-frontend.md) | Community members, end users | `/help/user-guide` |
| [Admin Guide](./developer/admin-guide.md) | WordPress administrators, content managers | **Not public.** Moving into wp-admin › Karamoja › Help |
| [Technical Documentation](./developer/technical-documentation.md) | Developers, DevOps | **Not public** (repo only) |
| [Hosting Requirements](./hosting-requirements.md) | DevOps, hosting, infrastructure | — |
| FAQ (in-app) | General public | `/help/faq` |

## Quick Start

- **Browse the site:** Start at `/help/user-guide`
- **Manage content in WordPress:** See `developer/admin-guide.md` (staff only; moving into wp-admin)
- **Local development, architecture, REST:** See `developer/technical-documentation.md`

`/help/admin-guide` and `/help/technical` were removed from the public site (audit v3 §12.7) and redirect to `/help`.

## Architecture Summary

```
Next.js 15 Frontend  ←→  WordPress REST API  ←→  MySQL
  (c:\projects\...)         (XAMPP / production)
```

## Related Files in Repository

- `planning/wordpress-setup-checklist.md` — WordPress CPT and ACF setup
- `planning/wp-local-xampp-setup.md` — Local XAMPP configuration
- `wordpress-plugin/tk-partner-portal/README.md` — Partner portal plugin
- `.env.example` — Environment variable template
