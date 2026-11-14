# Visual check (FE-03 / FE-25)

The rebuilt site should look like the site it replaces. These tests take full-page pictures of every public page at
**desktop (1440 px)** and **mobile (390 px)** and compare them with "before" pictures taken once from the **frozen
sandbox** (`https://karamoja-cluster-hub.vercel.app`, Vercel deploys paused on 9 Nov 2026).

| Command | What it does |
|---|---|
| (nothing to install) | Uses Playwright's Chromium if installed (`npx playwright install chromium`, ~200 MB), otherwise the Google Chrome or Microsoft Edge on the computer. `set PW_CHANNEL=msedge` (or `chrome`) to choose. The browser that took the "before" pictures is saved in `__screenshots__/BROWSER.txt`; compare with the same one |
| `npm run test:visual:baseline` | Takes the "before" pictures from the sandbox into `tests/visual/__screenshots__/` (commit them) |
| `npm run test:visual` | Compares `http://localhost:3000` (run `npm run build && npm start` first) with them |
| `npm run test:visual -- <url>` | Compares another address, e.g. a Vercel preview |
| `npm run test:visual -- http://localhost:3000 --project=desktop` | Desktop only (`--project=mobile` for mobile) |
| `npx playwright show-report playwright-report/visual` | Opens the report: each difference side by side (before / after / diff) |

How to read the result:
- **Pass:** less than 2 % of the page differs. That's rendering noise, or a change too small to matter.
- **Fail:** a real layout change. Look at it in the report. Expected differences are fine: real content replaced
  made-up content, a fake section was removed, the text was corrected. Unexpected ones (spacing, colours, a missing
  block, a broken mobile layout) are bugs to fix.
- Pages the sandbox doesn't have (password pages, offline, partner guide, help articles, 404) have no "before"
  picture. The first comparison saves one, and later runs compare against it.
- **Masked:** maps, embedded frames, videos and `<time>` elements change between visits, so they show as a solid
  block. Add `data-visual-mask` to anything else that should be ignored.
- Detail pages (one alert, report, organisation, initiative, help article) are the first link on their list page, so
  the same test works whatever content the site has.

Retake the "before" pictures only if the reference itself should change. They are the record of the site before the
migration.
