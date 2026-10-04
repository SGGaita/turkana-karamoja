# Documentation Images

Place screenshots and illustrations here. They are served from `/docs/images/…` in the Next.js app.

## Folder structure

```
public/docs/images/
├── frontend/     ← Frontend User Guide screenshots
├── backend/      ← WordPress admin / Backend guide screenshots
└── technical/    ← Architecture diagrams, API tests, dev setup
```

## How to add an image

1. Save your screenshot as PNG or JPG using the filename shown in the doc placeholder (e.g. `homepage.png`).
2. Put the file in the matching folder above.
3. Open the guide source in `lib/docs/` and set the matching path in `lib/docs/image-placeholders.js` — paths are already wired; adding the file is enough.
4. Refresh the browser — the placeholder swaps to your image automatically.

## Recommended screenshot settings

- **Width:** 1440px (desktop) or 390px (mobile)
- **Format:** PNG for UI screenshots, JPG for photos
- **Naming:** Use kebab-case matching the placeholder filename

## File checklist

### Frontend (`frontend/`)
- [ ] homepage.png
- [ ] navigation.png
- [ ] early-warnings-list.png
- [ ] early-warnings-detail.png
- [ ] reports-list.png
- [ ] reports-detail.png
- [ ] community.png
- [ ] organizations.png
- [ ] contact-form.png
- [ ] mobile-view.png
- [ ] partner-portal.png
- [ ] partner-register.png

### Backend (`backend/`)
- [ ] wp-dashboard.png
- [ ] alerts-pending.png
- [ ] alert-review.png
- [ ] reports-pending.png
- [ ] org-approval.png
- [ ] site-header-settings.png
- [ ] hero-settings.png
- [ ] acf-fields.png
- [ ] plugins-list.png

### Technical (`technical/`)
- [ ] architecture-diagram.png
- [ ] project-structure.png
- [ ] env-local.png
- [ ] local-dev-setup.png
- [ ] api-browser-test.png
- [ ] auth-flow-diagram.png
- [ ] deployment-overview.png
