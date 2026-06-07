# Custom CMS — Python / FastAPI + PostgreSQL Backend

Replace the planned WordPress CMS with a purpose-built headless CMS using a Python FastAPI backend, PostgreSQL database, and a Next.js admin dashboard living inside the existing project.

---

## Architecture Overview

```
c:\projects\turkana-karamoja-nextjs\
  backend/               ← Python FastAPI app (NEW)
  pages/
    admin/               ← CMS admin UI pages (NEW, protected)
  lib/
    api.js               ← replaces wordpress.js — calls Python backend
  planning/
    ...
```

The frontend (existing pages) fetches from `http://localhost:8000/api` in dev and `https://api.tkclimate.org/api` in production.

---

## Backend — `backend/` (Python FastAPI)

### Tech stack
| Package | Purpose |
|---|---|
| **FastAPI** | Async REST framework, auto OpenAPI docs |
| **SQLAlchemy 2 + asyncpg** | Async ORM + PostgreSQL driver |
| **Alembic** | Database migrations |
| **Pydantic v2** | Request/response validation |
| **python-jose** | JWT authentication |
| **passlib[bcrypt]** | Password hashing |
| **python-multipart** | File upload handling |
| **python-dotenv** | Environment variables |

### Directory structure
```
backend/
  app/
    main.py              ← FastAPI app, CORS, router registration
    database.py          ← async engine, session factory
    models/
      base.py            ← SQLAlchemy declarative base
      users.py
      alerts.py
      reports.py
      initiatives.py
      organizations.py
      programmes.py
      news.py
      languages.py
    schemas/             ← Pydantic models (request + response)
      alerts.py
      reports.py
      ...
      auth.py
    routers/
      auth.py            ← POST /api/auth/login, /me, /refresh
      alerts.py          ← CRUD for tk_alert
      reports.py
      initiatives.py
      organizations.py
      programmes.py
      news.py
      admin.py           ← user management, dashboard stats
    deps.py              ← get_db, get_current_user dependencies
  alembic/               ← migration scripts
  requirements.txt
  .env                   ← DATABASE_URL, SECRET_KEY, ALLOWED_ORIGINS
```

### Database schema

**`languages`**
| Column | Type |
|---|---|
| `code` (PK) | VARCHAR(8) — `en`, `sw`, `tkn`, `kj` |
| `name` | VARCHAR(64) |
| `flag_emoji` | VARCHAR(8) |
| `is_active` | BOOLEAN |

**`users`**
| Column | Type |
|---|---|
| `id` | UUID PK |
| `name` | VARCHAR |
| `email` | VARCHAR UNIQUE |
| `password_hash` | VARCHAR |
| `role` | ENUM: `admin`, `editor`, `viewer` |
| `created_at` | TIMESTAMPTZ |

**Content tables (pattern — same for all types)**
`alerts` + `alert_translations`:
```
alerts
  id UUID PK
  alert_level  ENUM(red, orange, yellow, green)
  area         TEXT
  source       VARCHAR
  issued_at    TIMESTAMPTZ
  valid_until  TIMESTAMPTZ
  status       ENUM(draft, published, archived)
  created_by   UUID FK → users.id
  created_at   TIMESTAMPTZ

alert_translations
  id        UUID PK
  alert_id  UUID FK → alerts.id  ON DELETE CASCADE
  lang_code VARCHAR(8) FK → languages.code
  title     TEXT
  body      TEXT
  actions   JSONB        ← array of action strings
  UNIQUE(alert_id, lang_code)
```
Same pattern applied to: `reports/report_translations`, `initiatives/initiative_translations`, `organizations/organization_translations`, `programmes/programme_translations`, `news_posts/news_translations`.

**`media_files`** — for uploaded report PDFs / initiative images
```
id UUID PK, original_name, stored_path, mime_type, size_bytes, uploaded_by UUID FK, created_at
```

### Key API endpoints
```
POST  /api/auth/login             → { access_token, user }
GET   /api/auth/me                → current user (auth required)

GET   /api/alerts?lang=en         → published alerts in language
POST  /api/alerts                 → create alert (editor+)
PUT   /api/alerts/{id}            → update alert (editor+)
DELETE /api/alerts/{id}           → delete (admin only)

GET   /api/reports?lang=sw
GET   /api/initiatives?lang=tkn
GET   /api/organizations?lang=kj
GET   /api/programmes?lang=en
GET   /api/news?lang=en

POST  /api/media/upload           → multipart file upload → { url }

GET   /api/admin/stats            → dashboard counts (admin+)
GET   /api/admin/users            → list users (admin only)
POST  /api/admin/users            → create user (admin only)
```

---

## Admin UI — `pages/admin/` (Next.js, protected)

All admin pages are protected by a JWT cookie check in `getServerSideProps`. Unauthenticated users are redirected to `/admin/login`.

### Pages
| Route | Description |
|---|---|
| `/admin` | Dashboard — counts, recent activity, quick links |
| `/admin/login` | Email + password login form |
| `/admin/alerts` | List + publish/archive alerts |
| `/admin/alerts/new` | Create alert with per-language translation tabs |
| `/admin/alerts/[id]` | Edit alert |
| `/admin/reports` | Reports list + upload |
| `/admin/initiatives` | Initiatives + image upload |
| `/admin/organizations` | Organizations directory editor |
| `/admin/programmes` | Community programmes editor |
| `/admin/news` | News posts editor |
| `/admin/users` | User management (admin only) |

### Translation tab pattern (all content forms)
Each content create/edit form shows a tab bar: **EN · SW · TKN · KJ**. Switching tabs saves/loads the translation for that language. All tabs share the same non-translated fields (alert_level, status, file_url etc.).

### Admin UI components to create
- `components/admin/AdminLayout.js` — sidebar nav + top bar
- `components/admin/ContentTable.js` — reusable list table with status badges
- `components/admin/TranslationTabs.js` — language tab switcher for forms
- `components/admin/FileUpload.js` — drag-and-drop upload field
- `components/admin/ProtectedRoute.js` — SSP auth guard

---

## Frontend (`lib/api.js`) — replaces `lib/wordpress.js`

```js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getAlerts(locale = 'en') {
  const res = await fetch(`${API_BASE}/api/alerts?lang=${locale}`);
  if (!res.ok) return [];
  return res.json();
}
// same pattern for getReports, getInitiatives, getOrganizations, etc.
```

Env variable: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`

---

## Data fetching strategy (unchanged from WordPress plan)
| Page | Method |
|---|---|
| `/early-warnings` | `getServerSideProps` — always fresh |
| `/reports`, `/community`, `/organizations` | `getStaticProps` + ISR revalidate |
| Landing page | `getStaticProps` + `revalidate: 120` |

---

## Environment files

`backend/.env`:
```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/tkclimate
SECRET_KEY=<random 256-bit key>
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=http://localhost:3001,https://tkclimate.org
MEDIA_UPLOAD_DIR=./uploads
```

`.env.local` (Next.js):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## Files to create

| Path | Description |
|---|---|
| `backend/requirements.txt` | Python dependencies |
| `backend/app/main.py` | FastAPI entry point |
| `backend/app/database.py` | DB connection |
| `backend/app/models/*.py` | SQLAlchemy models |
| `backend/app/schemas/*.py` | Pydantic schemas |
| `backend/app/routers/*.py` | Route handlers |
| `backend/app/deps.py` | Shared dependencies |
| `backend/alembic/` | Migration setup |
| `lib/api.js` | Next.js API client |
| `pages/admin/**.js` | Admin UI pages |
| `components/admin/**.js` | Admin UI components |
| `.env.local` | Next.js env |
| `backend/.env` | Python env |

---

## Development workflow

1. `cd backend && uvicorn app.main:app --reload --port 8000` — start API
2. `cd .. && npm run dev` — start Next.js on port 3001
3. Visit `http://localhost:3001/admin` to manage content
4. Visit `http://localhost:8000/docs` for auto-generated API docs (FastAPI Swagger UI)
