import { forwardRef } from 'react';
import NextLink from 'next/link';
import { isPageHref } from '../lib/links';

/**
 * What MUI buttons and links render for an `href` (theme.js). Internal pages go through Next.js's Link, so they keep
 * the reader's language (/sw/…, FE-26) and load without a full page reload. Files, API routes, anchors, downloads
 * and other sites stay plain links.
 */

const LinkBehavior = forwardRef(function LinkBehavior({ href, ...props }, ref) {
  if (isPageHref(href, props)) return <NextLink ref={ref} href={href} {...props} />;
  return <a ref={ref} href={href} {...props} />;
});

export default LinkBehavior;
