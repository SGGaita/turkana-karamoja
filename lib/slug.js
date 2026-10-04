/** Turns a title into a URL-safe slug: lowercase, ASCII, hyphen-separated. */
export function slugify(text) {
  return String(text || '')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

/**
 * Builds an SEO-friendly path segment that still carries the real id, e.g.
 * "turkana-karamoja-report-2026-26" for title="Turkana Karamoja Report 2026", id=26.
 * No backend lookup-by-slug needed: the trailing "-<id>" is always parsed back out.
 */
export function buildSlugPath(title, id) {
  const slug = slugify(title);
  return slug ? `${slug}-${id}` : String(id);
}

/** Recovers the real id from a slug path segment. Also accepts a bare id
 *  (old-style link) so previously shared/bookmarked URLs keep resolving. */
export function extractIdFromSlugPath(param) {
  const str = String(param || '');
  if (/^\d+$/.test(str)) return str;
  const match = str.match(/-(\d+)$/);
  return match ? match[1] : str;
}
