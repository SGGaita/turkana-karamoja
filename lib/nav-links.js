/**
 * Normalizes the main navbar links coming from WordPress so the menu is the same
 * in every environment, whatever menu the WordPress database happens to hold.
 *
 * - Hides links we never want in the main navbar (e.g. Organizations).
 * - Makes sure "Contact Us" is always present.
 */
const HIDDEN_NAV_PATHS = new Set(['/organizations']);
const CONTACT_PATHS = new Set(['/contact', '/contact-us']);

const CONTACT_LABELS = {
  en: 'Contact Us',
  sw: 'Wasiliana Nasi',
};

function pathOf(href = '') {
  const path = String(href).split(/[?#]/)[0].replace(/\/+$/, '');
  return path || '/';
}

export function normalizeNavLinks(links = [], locale = 'en') {
  const nav = (Array.isArray(links) ? links : []).filter(
    (link) => link && !HIDDEN_NAV_PATHS.has(pathOf(link.href))
  );

  if (!nav.some((link) => CONTACT_PATHS.has(pathOf(link.href)))) {
    const contact = { label: CONTACT_LABELS[locale] || CONTACT_LABELS.en, href: '/contact' };
    const partnersIndex = nav.findIndex((link) => pathOf(link.href) === '/partners-stakeholders');
    if (partnersIndex >= 0) nav.splice(partnersIndex, 0, contact);
    else nav.push(contact);
  }

  return nav;
}
