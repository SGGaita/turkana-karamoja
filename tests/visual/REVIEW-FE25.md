# FE-25 visual review (16 Nov 2026)

Every page in the visual check, desktop and mobile, was compared side by side with the "before" pictures of the
frozen sandbox. The new site ran as a production build against a copy of the local CMS after cut-over (Karamoja Core
in full mode). That copy holds the local site's data, not the sandbox's, so most pages differ in **content**; the
review looked at layout, spacing, colours, fonts, missing blocks and mobile behaviour.

Pixel ratios are not a useful measure here: every page has a different height because its content differs, and the
check fails on any page longer or shorter than its "before" picture. The final comparison on real data happens after
cut-over (FE-28).

## Fixed

| What | Where | Fix |
|---|---|---|
| Phones could scroll sideways: the page was 394 px wide in a 390 px screen (the sandbox: 392) | Every page, mobile | The logo in the top bar no longer pushes the menu button off the screen: it shrinks on small screens (`Navbar`) |
| The Community page had no links to Water points, Assistance, Planting calendar and Health | `/community` | On the sandbox they were demo "programmes", removed with the demo content (§8 7r). The four service pages are now always listed, with each page's own header from Website pages (`serviceCardsByLocale`), followed by any real programmes |
| "0 Active Alerts" above a list of active yellow alerts | Home | The count includes every active alert; the dot is red when one is red or orange, amber otherwise (`WarningsStrip`) |
| Montserrat loaded from Google Fonts on every first visit | Every page | Bundled with the website (`@fontsource/montserrat`): works offline from the first visit, no third-party font host in the security headers, no late redraw. Also makes the visual check independent of Google |
| "Regional Offices" heading and its text missing above the offices | `/contact` | Core 0.43.0: Contact gets the heading and a new text field; saved pages are filled where empty |
| A row of the three newest organisations, with no heading, at the bottom of About | `/about` | Core 0.43.0: About → Partners shows nothing until organisations are picked (it fell back to "the latest") |
| Organisation "Website" pointed at the CMS's own page for the organisation | Organisation pages | Core 0.43.0: the old plugin stored that address in the same field on approval; the API ignores it and the migration clears it |

## Accepted (intended)

| Difference | Pages | Why |
|---|---|---|
| Fake content gone: alert ticker with sample alerts, sample water points, assistance sites, planting advisories, health alerts, "Key contacts", social links marked "URL pending", footer links to pages that don't exist (Our Partners, Data Sources, API Access, Methodology, Weather Forecasts, Community Bulletins, Donor Portal) | Home, Community pages, Contact, footer | FE-24 / §8 7m, 7r, 7ad |
| Raw `<p>` code and `&amp;` no longer shown in alert text and About | Early warnings, health, About | Text is cleaned (FE-18, Core 0.27.0) |
| "SMS", "real-time" and "live" claims removed | About, Community, Water points | The hub has no SMS service or live sensors (audit v3) |
| New: "What's happening now", "Download for offline use", "Saved documents", search on Help, Partner Guide card, toll-free helplines on Help, "Last updated" on alerts, "Ended and earlier advisories" | Home, footer, Help, Early warnings | FE-08–FE-10, help portal, FE-18 |
| User guide is a list of articles instead of one long page | `/help/user-guide` | Help portal (§8 7g) |
| Initiative pictures show whole (the sandbox cropped them to a strip), no `[&hellip;]` in the header | Community, initiative pages | FE-19 |
| Top-bar logo slightly narrower on phones | Mobile | The fix for sideways scrolling above |
| Header at 1440 px: the hub's name is no longer beside the logo (FE-28) | Desktop | The full menu used to show from 900 px and ran off the page below ~1400 px (e.g. 1280 / 1366 px laptops). Now: menu button below 1280 px; full menu from 1280 px (smaller logo below 1440 px); the name beside the logo below 1280 px and from 1720 px |

## Not differences (the test copy)

- Pictures from `images.unsplash.com` (default page headers) and the maps cannot load in the review workspace; maps
  are masked anyway.
- The copy of the local CMS has test items from the cut-over dry run ("x", "Pin me", "Org 2A6u", two empty water
  points) and none of the sandbox's demo items.

## For the CMS content (not code)

- **Site settings → Contacts → Offices** still lists the old site's placeholder numbers ("+254 (0)54 22 XXX") and
  addresses. Core 0.43.0 adds this to the cut-over checklist (Karamoja → Migration).
- **Website pages → Community → Partner radio stations**: on the local site all four stations are under Kenya /
  Turkana; the sandbox had Radio Karamoja and Rhino Radio Uganda under Uganda / Moroto. One is named "Turkana FMs".
