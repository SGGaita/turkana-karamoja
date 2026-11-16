/**
 * Is an href one of the website's own pages (so it should go through Next.js's Link and keep the reader's language,
 * FE-26)? Files, API routes, Next.js files, downloads, new tabs and other sites are not.
 */
export function isPageHref(href, props = {}) {
  if (typeof href !== 'string' || !href.startsWith('/') || href.startsWith('//')) return false;
  if (props.download !== undefined || props.target === '_blank') return false;
  return !/^\/(api|cms-files|_next|icons|images)(\/|$)/.test(href) && !/\.[a-z0-9]+(\?|#|$)/i.test(href);
}
