# Help screenshots (WP-44)

Takes every picture used in the help guides in one run and saves them as WebP into Karamoja Core
(`plugins/karamoja-core/assets/help/`), where the help articles use them with `<img src="{asset:name.webp}" alt="…">`.
The list, with alt texts and the article each belongs to, is `shots.mjs`.

## Before the run

- The website as a **production build** against the CMS: `npm run build && npm start`.
- **Karamoja Core in full mode** (after cut-over) for the staff pictures.
- **Test accounts only, no real people**:
  - a test organisation (e.g. *Example Pastoralist Network*), approved, with a partner account (e.g. `partner@example.org`)
    and a password set; a couple of its submissions (one waiting for review, one approved);
  - a staff account (Administrator or Hub Reviewer).
  The script also replaces any email address that isn't `@example.org`, and any phone number, before each picture.
- Real content for the public pages (published warnings with an area and actions, reports, water points), and the
  languages marked ready in Site settings → Languages, so the pictures show what visitors really see.
- An internet connection: the maps need their tiles.

## Run

```bash
# In this repository. Values in the shell only, never in a file you commit.
export SHOTS_OUT="C:/xampp/htdocs/karamoja-cluster-fe/wp-content/plugins/karamoja-core/assets/help"
export SHOTS_CMS="http://localhost/karamoja-cluster-fe"     # default: NEXT_PUBLIC_WP_BASE_URL
export SHOTS_PARTNER_EMAIL="partner@example.org"
export SHOTS_PARTNER_PASSWORD="…"
export SHOTS_WP_USER="…"
export SHOTS_WP_PASSWORD="…"
npm run help:shots
```

- One picture or a few: `SHOTS_ONLY="partner-|user-install" npm run help:shots`.
- Specific items for the staff pictures (else the first found): `SHOTS_PENDING_ALERT`, `SHOTS_PUBLISHED_ALERT`, `SHOTS_TEST_ORG`.
- Browser: `PW_CHANNEL=chrome` or `PW_CHROME_PATH=…`, as for the visual check.

Each line printed shows the size (at most 150 KB: quality is lowered until it fits), the width and the article.

## After the run

1. Look at every picture. Check that no personal data is visible, and that it shows what the article says.
2. In the CMS repository: `git status` shows the changed pictures. A new picture also needs its `{asset:…}` in the
   article (`includes/help/articles-*.php`); the PHPUnit test `test-help-assets.php` fails on a picture that is missing,
   unused, without alt text, too big or too wide.
3. Bump Core's version, so sites update the help articles; commit.

## Still to take on real data (after cut-over)

The first set (16 pictures, Core 0.42.0) was taken on a copy of the local site. These need a site with real content and
working maps: `partner-submit-advisory` (map), `user-early-warning`, `user-warnings-map` (map), `user-water-point` (map),
`user-language-picker` (needs the languages marked ready), `staff-review-queue`, `staff-alert-validity-map` (map),
`staff-website-updates` (needs a working website connection). Take them, add each `{asset:…}` to its article
(`article` in `shots.mjs`), and commit.
