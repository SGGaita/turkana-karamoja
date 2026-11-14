/**
 * Pages in the visual check (FE-03 / FE-25). `detail` pages are found by following the first matching link on their
 * list page, so the same spec works on the sandbox and on a local copy with different content.
 * `since: 'new'` marks pages the frozen sandbox doesn't have: no "before" picture; they're captured on first comparison.
 */
export const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'early-warnings', path: '/early-warnings' },
  { name: 'alert-detail', detail: { from: '/early-warnings', link: /^\/early-warnings\/[^/?#]+$/ } },
  { name: 'reports', path: '/reports' },
  { name: 'report-detail', detail: { from: '/reports', link: /^\/reports\/[^/?#]+$/ } },
  { name: 'community', path: '/community' },
  { name: 'water-points', path: '/community/water-points' },
  { name: 'assistance', path: '/community/assistance' },
  { name: 'planting-calendar', path: '/community/planting-calendar' },
  { name: 'health', path: '/community/health' },
  {
    name: 'initiative-detail',
    detail: { from: '/community', link: /^\/community\/(?!water-points$|assistance$|planting-calendar$|health$)[^/?#]+$/ },
  },
  { name: 'organizations', path: '/organizations' },
  { name: 'organization-detail', detail: { from: '/organizations', link: /^\/organizations\/[^/?#]+$/ } },
  { name: 'about', path: '/about' },
  { name: 'contact', path: '/contact' },
  { name: 'help', path: '/help' },
  { name: 'help-faq', path: '/help/faq' },
  { name: 'help-user-guide', path: '/help/user-guide' },
  { name: 'partners', path: '/partners-stakeholders' },
  // Not on the frozen sandbox.
  { name: 'help-partner-guide', path: '/help/partner-guide', since: 'new' },
  { name: 'help-article', since: 'new', detail: { from: '/help/user-guide', link: /^\/help\/(?!faq$|user-guide$|partner-guide$)[^/?#]+$/ } },
  { name: 'forgot-password', path: '/partners-stakeholders/forgot-password', since: 'new' },
  { name: 'offline', path: '/offline', since: 'new' },
  { name: 'not-found', path: '/this-page-does-not-exist', since: 'new' },
];
