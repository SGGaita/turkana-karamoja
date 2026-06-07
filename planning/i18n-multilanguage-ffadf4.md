# Multi-Language Support — English, Swahili, Turkana & Ngakarimojong

Add four-language support using Next.js built-in i18n routing (subdirectory URLs), `next-i18next` for UI strings, and the **custom Python/PostgreSQL CMS** (see `custom-cms-postgres-python-ffadf4.md`) to manage content translations per language.

---

## Language Codes
| Language | Locale Code | URL Prefix | DB `languages.code` |
|---|---|---|---|
| English | `en` | `/` (default) | `en` |
| Swahili | `sw` | `/sw/` | `sw` |
| Turkana | `tkn` | `/tkn/` | `tkn` |
| Ngakarimojong | `kj` | `/kj/` | `kj` |

---

## CMS / Backend Side

### How translations are stored
Each content type has a base table and a `*_translations` table (see CMS plan for full schema). Example:

```sql
-- alert_translations
alert_id | lang_code | title          | body            | actions
---------|-----------|----------------|-----------------|--------
<uuid>   | en        | Flash Flood... | Heavy rainfall  | [...]
<uuid>   | sw        | Onyo la Mafur… | Mvua nyingi...  | [...]
<uuid>   | tkn       | (placeholder)  | (placeholder)   | []
<uuid>   | kj        | (placeholder)  | (placeholder)   | []
```

### API — `lang` query parameter
The Python FastAPI backend accepts a `lang` param on every content endpoint:
```
GET /api/alerts?lang=sw        → alert titles/body in Swahili
GET /api/reports?lang=tkn      → report titles in Turkana
GET /api/organizations?lang=kj → org names in Ngakarimojong
```
Falls back to `en` if a translation row is missing for the requested language.

### CMS editor workflow
1. Editor creates content in English in the admin UI (`/admin/alerts/new`)
2. Switches to the **SW / TKN / KJ tab** in the same form
3. Enters translated title, body and actions for each language
4. Publishes — Next.js serves the correct language via the URL locale

---

## Next.js Changes

### 1. `next.config.js` — i18n routing
```js
i18n: {
  locales: ['en', 'sw', 'tkn', 'kj'],
  defaultLocale: 'en',
}
```
Automatically generates `/sw/early-warnings`, `/tkn/reports`, `/kj/submit` etc.

### 2. `next-i18next` — UI string translations
For static labels (button text, nav items, section headings, form labels) that don't come from the API:

**Files to create:**
```
public/locales/
  en/common.json   ← full English UI strings
  sw/common.json   ← Swahili UI strings
  tkn/common.json  ← Turkana UI strings (English fallbacks initially)
  kj/common.json   ← Ngakarimojong UI strings (English fallbacks initially)
```

**Install:** `next-i18next` + `react-i18next`
**Config file:** `next-i18next.config.js`

Example `en/common.json`:
```json
{
  "nav.home": "Home",
  "nav.earlyWarnings": "Early Warnings",
  "alerts.recommended": "Recommended Actions",
  "alerts.download": "Download PDF",
  "submit.title": "Submit an Advisory",
  "forecast.sevenDay": "7-Day Forecast"
}
```

Swahili `sw/common.json`:
```json
{
  "nav.home": "Nyumbani",
  "nav.earlyWarnings": "Onyo la Mapema",
  "alerts.recommended": "Hatua Zinazopendekezwa",
  "alerts.download": "Pakua PDF",
  "submit.title": "Wasilisha Ushauri",
  "forecast.sevenDay": "Utabiri wa Siku 7"
}
```

Turkana / Ngakarimojong files start with English fallbacks — translators update the JSON without any code change.

### 3. `lib/api.js` — pass locale to all API calls (replaces `lib/wordpress.js`)
```js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getAlerts(locale = 'en') {
  const res = await fetch(`${API_BASE}/api/alerts?lang=${locale}`);
  if (!res.ok) return [];
  return res.json();
}
// same pattern: getReports, getInitiatives, getOrganizations, getProgrammes, getNews
```

### 4. Data fetching pages — pass `locale` from Next.js context
```js
export async function getServerSideProps({ locale }) {
  const alerts = await getAlerts(locale);
  return { props: { alerts } };
}
```
ISR pages (`getStaticProps`) also receive `locale` from context and forward it to the API.

### 5. `components/LanguageSwitcher.js`
- Dropdown in the Navbar topbar showing flag + language name
- Uses `next/router` to push to same path with new locale
- Persists chosen locale in a cookie for return visits
- Languages: 🇬🇧 English · 🇰🇪 Swahili · Turkana · Karamoja

### 6. `components/Navbar.js` — add LanguageSwitcher
Add `<LanguageSwitcher />` to the topbar strip (right side).

### 7. `_app.js` — wrap with `appWithTranslation`
Standard `next-i18next` wrapping to inject translations into all pages.

---

## Files to create / modify

| File | Action |
|---|---|
| `next.config.js` | **Modify** — add `i18n` block |
| `next-i18next.config.js` | **Create** — i18next configuration |
| `public/locales/en/common.json` | **Create** — full English UI strings |
| `public/locales/sw/common.json` | **Create** — Swahili UI strings |
| `public/locales/tkn/common.json` | **Create** — Turkana (English fallbacks) |
| `public/locales/kj/common.json` | **Create** — Ngakarimojong (English fallbacks) |
| `lib/api.js` | **Create** — replaces `lib/wordpress.js`, adds `locale` param |
| `components/LanguageSwitcher.js` | **Create** — language toggle dropdown |
| `components/Navbar.js` | **Modify** — add LanguageSwitcher to topbar |
| `pages/_app.js` | **Modify** — wrap with `appWithTranslation` |
| All `pages/*.js` | **Modify** — add `serverSideTranslations` + `useTranslation` hook, pass `locale` to API calls |

---

## Notes
- Content translations live in the PostgreSQL `*_translations` tables managed via the CMS admin UI — no code change needed to add/update translated content
- UI string translations (JSON files) can be updated by translators without a code change or rebuild
- The language switcher is visible on all pages and mobile-friendly
- `hreflang` meta tags generated automatically by Next.js i18n for SEO
- The Python API returns English content as fallback when a translation row is absent for a locale
