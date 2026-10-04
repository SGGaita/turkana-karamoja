import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fallbackSiteHeader, fallbackHomeSections } from '../lib/fallback-data';

export const LANG_COOKIE = 'tk_hub_lang';
export const SUPPORTED_LOCALES = ['en', 'sw', 'tu', 'pk', 'ng'];

function readLangCookie() {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(/(?:^|;\s*)tk_hub_lang=([^;]+)/);
  const value = decodeURIComponent(match?.[1] || '');
  return SUPPORTED_LOCALES.includes(value) ? value : 'en';
}

function writeLangCookie(locale) {
  if (typeof document === 'undefined') return;
  document.cookie = `${LANG_COOKIE}=${encodeURIComponent(locale)};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

const LanguageContext = createContext({
  locale: 'en',
  setLocale: () => {},
  siteHeaderByLocale: { en: fallbackSiteHeader, sw: fallbackSiteHeader },
  homeSectionsByLocale: { en: fallbackHomeSections, sw: fallbackHomeSections },
  heroByLocale: null,
});

export function LanguageProvider({
  children,
  siteHeaderByLocale,
  homeSectionsByLocale,
  heroByLocale = null,
}) {
  const [locale, setLocaleState] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(readLangCookie());
    setMounted(true);
  }, []);

  const setLocale = useCallback((nextLocale) => {
    if (!SUPPORTED_LOCALES.includes(nextLocale)) return;
    setLocaleState(nextLocale);
    writeLangCookie(nextLocale);
  }, []);

  const value = useMemo(
    () => ({
      locale: mounted ? locale : 'en',
      setLocale,
      siteHeaderByLocale: siteHeaderByLocale || { en: fallbackSiteHeader, sw: fallbackSiteHeader },
      homeSectionsByLocale: homeSectionsByLocale || { en: fallbackHomeSections, sw: fallbackHomeSections },
      heroByLocale,
    }),
    [mounted, locale, setLocale, siteHeaderByLocale, homeSectionsByLocale, heroByLocale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useLocalizedSiteHeader() {
  const { locale, siteHeaderByLocale } = useLanguage();
  return siteHeaderByLocale[locale] || siteHeaderByLocale.en || fallbackSiteHeader;
}

export function useLocalizedHomeSections() {
  const { locale, homeSectionsByLocale } = useLanguage();
  return homeSectionsByLocale[locale] || homeSectionsByLocale.en || fallbackHomeSections;
}

export function useLocalizedHero(fallbackHero) {
  const { locale, heroByLocale } = useLanguage();
  if (heroByLocale) {
    return heroByLocale[locale] || heroByLocale.en || fallbackHero;
  }
  return fallbackHero;
}
