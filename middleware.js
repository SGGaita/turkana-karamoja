import { NextResponse } from 'next/server';
import { DEFAULT_LOCALE, LOCALE_COOKIE, OLD_LOCALE_COOKIE, siteLocale } from './lib/locales';

/**
 * A returning visitor who chose another language in the picker (cookie NEXT_LOCALE, or tk_hub_lang from before
 * FE-26) is sent from an English address to the same page in their language: /reports → /sw/reports.
 *
 * Only English addresses are redirected (they have no language prefix); /sw/… etc. are always served as asked, so a
 * shared link opens in the language it was shared in. Search engines send no cookie and see every address as is.
 */
export function middleware(request) {
  const url = request.nextUrl;
  if (url.locale && url.locale !== DEFAULT_LOCALE) return NextResponse.next();
  const chosen =
    siteLocale(request.cookies.get(LOCALE_COOKIE)?.value) || siteLocale(request.cookies.get(OLD_LOCALE_COOKIE)?.value);
  if (!chosen || chosen === DEFAULT_LOCALE) return NextResponse.next();
  const to = url.clone();
  to.locale = chosen;
  const res = NextResponse.redirect(to, 307);
  // Carry a choice made before FE-26 over to the new cookie.
  if (!request.cookies.get(LOCALE_COOKIE)) {
    res.cookies.set(LOCALE_COOKIE, chosen, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  }
  return res;
}

export const config = {
  // Pages only: not API routes, Next.js files, report documents, or any file with an extension.
  matcher: ['/((?!api/|_next/|cms-files/|.*\\.[A-Za-z0-9]+$).*)'],
};
