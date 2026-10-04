/**
 * Default routes for top-bar links when WordPress still has placeholder "#" hrefs.
 */
export const TOPBAR_LINK_DEFAULTS = {
  'Login / Register': '/partners-stakeholders',
  'API Access': '/help/technical#api-reference',
  Help: '/help',
};

export function resolveTopbarLink(label, href) {
  if (href && href !== '#') return href;
  return TOPBAR_LINK_DEFAULTS[label] || href || '#';
}

export function resolveTopbarLinks(links = []) {
  return links.map((link) => ({
    ...link,
    href: resolveTopbarLink(link.label, link.href),
  }));
}
