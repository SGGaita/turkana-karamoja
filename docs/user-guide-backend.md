# Turkana–Karamoja Climate Hub — Backend & Admin Guide

A guide for WordPress administrators managing the Climate Hub content management system, partner approvals, and day-to-day CMS operations.

---

## Table of Contents

1. [Overview](#overview)
2. [Accessing the WordPress Admin](#accessing-the-wordpress-admin)
3. [Content Types (Custom Post Types)](#content-types-custom-post-types)
4. [Publishing & Reviewing Advisories](#publishing--reviewing-advisories)
5. [Publishing & Reviewing Reports](#publishing--reviewing-reports)
6. [Organisation Registration & Approval](#organisation-registration--approval)
7. [Site Header & Navigation Settings](#site-header--navigation-settings)
8. [Homepage Hero & About Page](#homepage-hero--about-page)
9. [ACF Field Configuration](#acf-field-configuration)
10. [Required Plugins](#required-plugins)
11. [User Roles & Permissions](#user-roles--permissions)
12. [Contact Form Submissions](#contact-form-submissions)
13. [Routine Maintenance](#routine-maintenance)

---

## Overview

The Climate Hub backend is a headless WordPress installation that serves as the content management system (CMS) and partner portal API. Administrators manage content through wp-admin; partner organisations interact through the Next.js frontend portal.

This guide covers WordPress administration, content publishing workflows, organisation approval, and day-to-day CMS operations.

---

## Accessing the WordPress Admin

1. Open your WordPress admin URL (e.g. `http://localhost/karamoja-cluster-fe/wp-admin` for local XAMPP).
2. Sign in with your administrator credentials.
3. The dashboard shows posts, custom content types, and TK Hub settings added by the platform plugins.

> **Note:** Only authorised administrators and editors should have wp-admin access. Partner organisations use the frontend portal at `/partners-stakeholders` — they do not need wp-admin accounts unless assigned editor roles.

---

## Content Types (Custom Post Types)

The platform uses the following custom post types, registered via Custom Post Type UI or the TK Partner Portal plugin:

| Post Type | Slug | Purpose |
|-----------|------|---------|
| Alert / Advisory | `tk_alert` | Early warnings and climate advisories |
| Report / Document | `tk_report` | Situation reports, studies, and downloadable files |
| Initiative | `tk_initiative` | Climate and resilience initiatives on the homepage |
| Organization | `tk_organization` | Partner organisation profiles |
| Programme | `tk_programme` | Community programmes and services |
| Posts (standard) | `post` | News bulletins and community initiative articles |

---

## Publishing & Reviewing Advisories

1. Partner organisations submit advisories via the frontend portal (**Partners & Stakeholders → Submit Advisory**).
2. All portal submissions are automatically set to **Pending Review** status — they do not go live immediately.
3. In wp-admin, go to **Alerts** (`tk_alert`) and filter by **Pending** to see new submissions.
4. Review the advisory content, severity level, affected area, recommended actions, and attachments.
5. Click **Publish** to make the advisory live on the frontend, or move to **Draft/Reject** if changes are needed.
6. For emergency RED-level alerts, administrators may fast-track publication with post-publication review.

### Advisory Field Reference

- **Alert levels:** `red`, `orange`, `yellow`, `green` (stored in ACF field `alert_level`)
- **Each advisory includes:** area, body text, recommended actions, source, issued date, valid until
- **Attachments** uploaded by partners appear as media linked to the post

---

## Publishing & Reviewing Reports

1. Partners submit reports via the portal (**Submit Report** section).
2. Reports arrive in **Pending** status in wp-admin under **Reports** (`tk_report`).
3. Verify the description, categories, keywords, and attached files (PDF, Word, Excel, images).
4. Ensure the description ACF field is populated — without it, reports appear without summary text.
5. Publish when content is verified and accurate.

> **Note:** The `tk_report` post type must have both **Editor** and **Excerpt** support enabled for descriptions to save correctly.

---

## Organisation Registration & Approval

1. When an organisation registers on the frontend, a new `tk_organization` entry is created with status **Pending**.
2. In wp-admin → **Organizations**, review the application: name, contact, org type, country.
3. Click **Approve** to activate the organisation — this creates a WordPress user account and sends a password-setup email.
4. Click **Reject** to decline with an optional reason (the applicant can re-register).
5. Approved organisations can sign in at `/partners-stakeholders` and submit content.

### Additional Details

- Each approved org receives a unique reference (e.g. `TK-ORG-000012`)
- Organisation status can be checked via `GET /wp-json/tk/v1/organization-status?email=`
- Partners can track their submissions (pending, approved, rejected, withdrawn) in the portal dashboard

---

## Site Header & Navigation Settings

Navigation links, branding, and top bar content are managed through the **TK Hub Site Header** settings in wp-admin (provided by the `turkana-headless-hub` mu-plugin).

1. Go to **TK Hub → Site Header** in wp-admin.
2. Configure branding: title, tagline, logo.
3. Set top bar links:
   - Login/Register → `/partners-stakeholders`
   - API Access → `/help/technical#api-reference`
   - Help → `/help`
4. Configure main navigation links and the **Alerts** CTA button.
5. Save changes — the Next.js frontend fetches updates from `GET /wp-json/tk/v1/site-header`.

> **Note:** If Help or API Access links point to `#`, update them to the correct frontend routes as shown above.

---

## Homepage Hero & About Page

| Content Area | Management Location | API Endpoint |
|--------------|--------------------|--------------|
| Homepage hero | TK Hub → Hero settings | `GET /wp-json/tk/v1/hero` |
| About page | Standard WordPress Page with slug `about` | `GET /wp-json/wp/v2/pages?slug=about` |
| Contact page | TK Hub → Contact settings | `GET /wp-json/tk/v1/contact` |
| Initiatives & programmes | Managed as `tk_initiative` and `tk_programme` posts | Standard CPT endpoints |

---

## ACF Field Configuration

Advanced Custom Fields (ACF) stores structured metadata for each content type. **ACF to REST API** exposes these fields in WordPress REST responses consumed by the frontend.

| Post Type | Key Fields |
|-----------|------------|
| `tk_alert` | `alert_level`, `area`, `body`, `actions` (repeater), `source`, `issued_date`, `valid_until` |
| `tk_report` | `tag`, `categories`, `description`, `keywords`, `report_files`, `partner_orgs`, `publication_date` |
| `tk_organization` | `abbreviation`, `org_type`, `country_flag`, `portal_url` |
| `tk_initiative` | `tag`, `tag_color`, `description`, `image_url` |
| `tk_programme` | `emoji_icon`, `description`, `languages`, `color` |

> **Note:** See `planning/wordpress-setup-checklist.md` in the repository for the complete ACF field specification.

---

## Required Plugins

| Plugin | Purpose |
|--------|---------|
| Custom Post Type UI | Register custom post types (if not using plugin fallback) |
| Advanced Custom Fields (ACF) | Structured meta fields per content type |
| ACF to REST API | Expose ACF fields in `/wp-json` responses |
| JWT Authentication for WP REST API | Partner login and authenticated API calls |
| TK Partner Portal | Organisation registration, approval workflow, submission management |
| WP CORS (or functions.php) | Allow Next.js origin with Authorization header |

---

## User Roles & Permissions

| Role | Access |
|------|--------|
| **Administrator** | Full wp-admin access, organisation approval, content review and publishing |
| **Editor** | Can create and publish `tk_alert` and `tk_report` content |
| **Partner** (custom) | Created on org approval; authenticated via JWT for portal submissions only |
| **Public** | Read-only access to published content via REST API; no authentication required |

---

## Contact Form Submissions

Contact form submissions from the frontend are sent to `POST /wp-json/tk/v1/contact-submit` and stored for administrator review. Check wp-admin for contact enquiry notifications or the configured email destination.

---

## Routine Maintenance

1. Review pending advisories and reports daily (more frequently during emergencies).
2. Approve or reject new organisation registrations promptly.
3. Keep WordPress core, plugins, and PHP updated on the server.
4. Verify REST API endpoints respond correctly after updates (see [Technical Documentation](./technical-documentation.md)).
5. Back up the database and `wp-content/uploads` regularly.
6. Monitor JWT secret key security — never expose `wp-config.php` secrets.

---

## Related Documentation

- [Frontend User Guide](./user-guide-frontend.md) — Public website and partner portal usage
- [Technical Documentation](./technical-documentation.md) — Architecture, API reference, and deployment
