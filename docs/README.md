# Turkana–Karamoja Climate Hub — Documentation Index

This folder contains the canonical documentation for the Climate Hub platform. The same content is rendered in the web application at `/help`.

## Documentation Structure

| Document | Audience | Web Route |
|----------|----------|-----------|
| [Frontend User Guide](./user-guide-frontend.md) | Community members, end users | `/help/user-guide` |
| [Backend & Admin Guide](./user-guide-backend.md) | WordPress administrators, content managers | `/help/admin-guide` |
| [Technical Documentation](./technical-documentation.md) | Developers, DevOps, integrators | `/help/technical` |
| [Hosting Requirements](./hosting-requirements.md) | DevOps, hosting, infrastructure | — |
| FAQ (in-app) | General public | `/help/faq` |

## Quick Start

- **Browse the site:** Start at `/help/user-guide`
- **Manage content in WordPress:** See `/help/admin-guide`
- **Integrate with APIs:** See `/help/technical#api-reference`
- **Local development:** See `technical-documentation.md` → Local Development Setup

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
