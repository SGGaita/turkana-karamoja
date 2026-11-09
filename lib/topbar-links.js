/**
 * Default routes for top-bar links when WordPress still has placeholder "#" hrefs.
 */
export const TOPBAR_LINK_DEFAULTS = {
  'Login / Register': '/partners-stakeholders',
  Help: '/help',
};

/**
 * Pages that are no longer public (audit v3 §12.7): the admin guide moved into wp-admin
 * (Karamoja › Help) and the technical/API docs moved to the developer docs in the repo.
 * Links to them are dropped even if the CMS header settings still contain them.
 */
const RETIRED_PATHS = ['/help/admin-guide', '/help/technical'];
const RETIRED_LABELS = ['api access'];

export function isRetiredLink(link) {
  if (!link) return true;
  const label = String(link.label || '').trim().toLowerCase();
  const href = String(link.href || '');
  return RETIRED_LABELS.includes(label) || RETIRED_PATHS.some((p) => href.startsWith(p));
}

export function resolveTopbarLink(label, href) {
  if (href && href !== '#') return href;
  return TOPBAR_LINK_DEFAULTS[label] || href || '#';
}

export function resolveTopbarLinks(links = []) {
  return links
    .map((link) => ({ ...link, href: resolveTopbarLink(link.label, link.href) }))
    .filter((link) => !isRetiredLink(link));
}
