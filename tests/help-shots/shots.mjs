/**
 * Help screenshots (WP-44): every picture used in the help guides, and how to take it.
 * `npm run help:shots` takes them all (tests/help-shots/README.md). Names must match the `{asset:…}` tokens in the
 * help articles (karamoja-wp: plugins/karamoja-core/includes/help/articles-*.php).
 *
 * Fields:
 *   name     file name in plugins/karamoja-core/assets/help/ (WebP).
 *   article  help article key the picture belongs to (for the README and checks).
 *   alt      alt text to use in the article.
 *   as       'visitor' (website, signed out) | 'partner' (website, signed in as the test partner) | 'staff' (wp-admin).
 *   device   'desktop' (1280 px) | 'phone' (390 px).
 *   path     address (website, or wp-admin for staff).
 *   prepare  async (page, ctx) => {}: get the screen into the right state.
 *   target   async (page) => Locator: the part to capture (default: the visible screen).
 *   clip     { x, y, width, height }: a fixed part of the screen instead (for pop-ups outside the page).
 */

const byText = (page, re) => page.getByText(re).first();
const clickButton = async (page, name) => page.getByRole('button', { name }).first().click();
const settle = (page, ms = 800) => page.waitForTimeout(ms);

/** The first active early warning's address. */
async function firstAlert(page) {
  const href = await page.locator('a[href^="/early-warnings/"]').first().getAttribute('href');
  if (!href) throw new Error('No early warning is published: publish one (or use the test data).');
  return href;
}

export const SHOTS = [
  /* ── Partner Guide ─────────────────────────────────────────────────────────────── */
  {
    name: 'partner-register.webp',
    article: 'partner-register',
    alt: 'The registration form: organisation name, type and country, contact name and email.',
    as: 'visitor',
    device: 'desktop',
    path: '/partners-stakeholders',
    prepare: async (page) => { await clickButton(page, /^Register your organisation/); await settle(page); },
  },
  {
    name: 'partner-set-password.webp',
    article: 'partner-set-password',
    alt: 'Choosing a password: two password boxes, the strength bar and Save password.',
    as: 'visitor',
    device: 'phone',
    path: '/partners-stakeholders/set-password?uid=1&token=example',
  },
  {
    name: 'partner-sign-in.webp',
    article: 'partner-sign-in',
    alt: 'The Partner Sign In box with email and password.',
    as: 'visitor',
    device: 'desktop',
    path: '/partners-stakeholders',
    prepare: async (page) => { await clickButton(page, /^Sign in$/); await settle(page); },
    target: (page) => page.getByRole('dialog'),
  },
  {
    name: 'partner-dashboard.webp',
    article: 'partner-sign-in',
    alt: 'The partner dashboard: the menu on the left and the organisation overview.',
    as: 'partner',
    device: 'desktop',
    path: '/partners-stakeholders',
  },
  {
    name: 'partner-submit-advisory.webp',
    article: 'partner-submit-advisory',
    alt: 'The Submit Advisory form: warning level, how long it is valid, and the map to mark the area.',
    as: 'partner',
    device: 'desktop',
    path: '/partners-stakeholders',
    prepare: async (page) => { await page.getByRole('button', { name: /Submit Advisory/ }).first().click(); await settle(page, 1500); },
  },
  {
    name: 'partner-submit-report.webp',
    article: 'partner-submit-report',
    alt: 'The Submit Report form with the title, categories and the documents to upload.',
    as: 'partner',
    device: 'desktop',
    path: '/partners-stakeholders',
    prepare: async (page) => { await page.getByRole('button', { name: /Submit Report/ }).first().click(); await settle(page, 1200); },
  },
  {
    name: 'partner-submissions.webp',
    article: 'partner-review-statuses',
    alt: 'My submissions: each advisory and report with its status, such as Waiting for review or Published.',
    as: 'partner',
    device: 'desktop',
    path: '/partners-stakeholders',
    prepare: async (page) => { await byText(page, /^My Submissions$/).scrollIntoViewIfNeeded(); await settle(page); },
    // The list only (the panel with the Refresh button), not the whole dashboard.
    target: (page) => page.locator('xpath=//*[normalize-space(text())="My Submissions"]/ancestor::*[.//button[contains(., "Refresh")]][.//*[contains(text(), "Withdraw")]][1]'),
  },

  /* ── User Guide ────────────────────────────────────────────────────────────────── */
  {
    name: 'user-early-warning.webp',
    article: 'alert-levels',
    alt: 'An early warning: its colour level, the area, how long it is valid and what to do.',
    as: 'visitor',
    device: 'phone',
    path: '/early-warnings',
    prepare: async (page) => { await page.goto(new URL(await firstAlert(page), page.url()).href); await settle(page, 1200); },
  },
  {
    name: 'user-warnings-map.webp',
    article: 'using-the-site',
    alt: 'The early warnings map with the warning areas marked in their colours.',
    as: 'visitor',
    device: 'desktop',
    path: '/early-warnings',
    prepare: async (page) => { await page.locator('.leaflet-container').first().scrollIntoViewIfNeeded(); await settle(page, 2500); },
  },
  {
    name: 'user-reports-filters.webp',
    article: 'reports-library',
    alt: 'The reports library filters: search, organisation, category, country and dates.',
    as: 'visitor',
    device: 'desktop',
    path: '/reports',
    prepare: async (page) => { await settle(page, 1200); },
  },
  {
    name: 'user-water-point.webp',
    article: 'community-services',
    alt: 'A water point with its status and the date it was last updated.',
    as: 'visitor',
    device: 'phone',
    path: '/community/water-points',
    prepare: async (page) => { await byText(page, /Last updated/i).scrollIntoViewIfNeeded(); await settle(page); },
  },
  {
    name: 'user-language-picker.webp',
    article: 'languages',
    alt: 'The language picker open, listing the languages of the hub.',
    as: 'visitor',
    device: 'desktop',
    path: '/',
    prepare: async (page) => { await page.getByRole('button', { name: /English/ }).first().click(); await settle(page); },
    // The top right of the screen: the open list and the header around it.
    clip: { x: 760, y: 0, width: 520, height: 300 },
  },
  {
    name: 'user-alert-notifications.webp',
    article: 'alert-notifications',
    alt: 'The menu on a phone with the Get alert notifications button.',
    as: 'visitor',
    device: 'phone',
    path: '/',
    prepare: async (page) => { await page.getByRole('button', { name: 'Open menu' }).click(); await settle(page); },
  },
  {
    name: 'user-install-android.webp',
    article: 'install-and-offline',
    alt: 'The Install the Karamoja app offer on an Android phone, with Later and Install.',
    as: 'visitor',
    device: 'phone',
    path: '/',
    prepare: async (page) => {
      await page.evaluate(() => {
        localStorage.setItem('kc_install', JSON.stringify({ visits: 2, lastSeen: Date.now() }));
        const e = new Event('beforeinstallprompt');
        e.prompt = () => {};
        e.userChoice = Promise.resolve({ outcome: 'dismissed' });
        window.dispatchEvent(e);
      });
      await page.getByRole('dialog').waitFor({ timeout: 15000 });
      await settle(page);
    },
  },
  {
    name: 'user-install-iphone.webp',
    article: 'install-and-offline',
    alt: 'The steps to add Karamoja to the Home Screen on an iPhone: Share, Add to Home Screen, Add.',
    as: 'visitor',
    device: 'iphone',
    path: '/',
    prepare: async (page) => {
      await page.getByRole('button', { name: 'Open menu' }).click();
      await page.getByRole('button', { name: 'Install app' }).click();
      await page.getByRole('dialog', { name: /Home Screen/ }).waitFor({ timeout: 15000 });
      await settle(page);
    },
  },

  /* ── Staff help (wp-admin, Karamoja Core in full mode) ─────────────────────────── */
  {
    name: 'staff-review-queue.webp',
    article: 'staff-review-queue',
    alt: 'Karamoja → Review queue with submissions waiting and organisations to verify.',
    as: 'staff',
    device: 'desktop',
    path: 'admin.php?page=karamoja-review',
  },
  {
    name: 'staff-review-box.webp',
    article: 'staff-review-queue',
    alt: 'The Review box on a submitted advisory: approve, ask for changes or reject, with a note.',
    as: 'staff',
    device: 'desktop',
    path: (ctx) => `post.php?post=${ctx.pendingAlert}&action=edit`,
    target: (page) => page.locator('#karamoja-review'),
  },
  {
    name: 'staff-account-verification.webp',
    article: 'staff-organisations',
    alt: 'The Account and verification box of an organisation: status, last sign-in and the password links.',
    as: 'staff',
    device: 'desktop',
    path: (ctx) => `post.php?post=${ctx.testOrg}&action=edit`,
    target: (page) => page.locator('#karamoja-verification'),
  },
  {
    name: 'staff-alert-validity-map.webp',
    article: 'staff-alert-location',
    alt: 'An alert being edited: when it is valid, and the map to place it.',
    as: 'staff',
    device: 'desktop',
    path: (ctx) => `post.php?post=${ctx.pendingAlert}&action=edit`,
    prepare: async (page) => { await page.locator('#karamoja-alert-when').scrollIntoViewIfNeeded(); await settle(page, 1800); },
  },
  {
    name: 'staff-website-pages.webp',
    article: 'staff-website-pages',
    alt: 'Editing a website page: a card with Show on the site, the ? help and the language tabs.',
    as: 'staff',
    device: 'desktop',
    path: 'admin.php?page=karamoja-pages&edit=home',
  },
  {
    name: 'staff-site-languages.webp',
    article: 'staff-site-settings',
    alt: 'Site settings → Languages: which languages are ready to show on the website.',
    as: 'staff',
    device: 'desktop',
    path: 'admin.php?page=karamoja-settings',
    prepare: async (page) => { await page.locator('a[data-tab="languages"]').first().click(); await settle(page); },
    target: (page) => page.locator('#kc-languages'),
  },
  {
    name: 'staff-interface-text.webp',
    article: 'staff-translations',
    alt: 'Karamoja → Interface text with a language tab and how much is translated.',
    as: 'staff',
    device: 'desktop',
    path: 'admin.php?page=karamoja-interface-text',
  },
  {
    name: 'staff-translations-box.webp',
    article: 'staff-translations',
    alt: 'The Translations box on an edit screen, with a tab for each language.',
    as: 'staff',
    device: 'desktop',
    path: (ctx) => `post.php?post=${ctx.publishedAlert}&action=edit`,
    target: (page) => page.locator('#karamoja-translations'),
  },
  {
    name: 'staff-website-updates.webp',
    article: 'staff-change-not-showing',
    alt: 'Karamoja → Overview → Website updates: the last pages sent to the website and Refresh the whole website.',
    as: 'staff',
    device: 'desktop',
    path: 'admin.php?page=karamoja',
    target: (page) => page.locator('.card', { hasText: /Website updates/ }).first(),
  },
];
