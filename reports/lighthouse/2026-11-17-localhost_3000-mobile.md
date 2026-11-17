# Lighthouse: http://localhost:3000 (mobile), 2026-11-17

Lighthouse 12.8.2, phone (Moto G Power, slow 4G). Scores out of 100.

Indexing is off on this site (sandbox / local), so SEO loses points for *noindex*: expected.

| Page | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS | First things to fix |
|---|---|---|---|---|---|---|---|---|
| `/` | 63 | 92 | 100 | 58 | 4.2 s | 1,100 ms | 0 | `button`, `link`, and `menuitem` elements do not have accessible names.; Touch targets do not have sufficient size or spacing.; Links do not have descriptive text; Page is blocked from indexing |
| `/early-warnings` | 68 | 92 | 96 | 66 | 2.9 s | 1,560 ms | 0.013 | Browser errors were logged to the console; `button`, `link`, and `menuitem` elements do not have accessible names.; Touch targets do not have sufficient size or spacing.; Page is blocked from indexing |
| `/reports` | 59 | 96 | 100 | 66 | 4.2 s | 1,700 ms | 0 | Background and foreground colors do not have a sufficient contrast ratio.; Page is blocked from indexing |
| `/community` | 63 | 96 | 100 | 58 | 4.3 s | 1,070 ms | 0 | Background and foreground colors do not have a sufficient contrast ratio.; Links do not have descriptive text; Page is blocked from indexing |
| `/about` | 61 | 96 | 100 | 66 | 4.0 s | 1,370 ms | 0.001 | Touch targets do not have sufficient size or spacing.; Page is blocked from indexing |
| `/help` | 67 | 96 | 100 | 66 | 3.8 s | 920 ms | 0.035 | Background and foreground colors do not have a sufficient contrast ratio.; Page is blocked from indexing |
| `/contact` | 70 | 96 | 100 | 66 | 3.9 s | 730 ms | 0.019 | Background and foreground colors do not have a sufficient contrast ratio.; Page is blocked from indexing |

Full reports: `reports/lighthouse/html/` (open in a browser; not committed).
