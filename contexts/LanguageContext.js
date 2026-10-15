import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fallbackSiteHeader, fallbackHomeSections } from '../lib/fallback-data';
import { getHomeSections } from '../lib/wordpress';

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

// Home sections (footer, about, get-involved copy) fetched from the CMS in the background.
// Cached in memory for the session and in localStorage across visits so navigation never
// waits on the CMS; the bundled fallback content renders until the CMS answers.
const HOME_SECTIONS_CACHE_KEY = 'tk_hub_home_sections_v1';
const HOME_SECTION_LOCALES = ['en', 'sw'];
const HOME_SECTIONS_MAX_AGE_MS = 1000 * 60 * 30;
const homeSectionsMemory = {};
const homeSectionsInflight = {};

function readCachedHomeSections() {
  try {
    const raw = window.localStorage.getItem(HOME_SECTIONS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCachedHomeSections(locale, data) {
  try {
    const all = readCachedHomeSections();
    all[locale] = { data, at: Date.now() };
    window.localStorage.setItem(HOME_SECTIONS_CACHE_KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable — memory cache still works */
  }
}

function loadHomeSections(locale) {
  if (homeSectionsInflight[locale]) return homeSectionsInflight[locale];
  homeSectionsInflight[locale] = getHomeSections(locale)
    .then(({ data, apiStale }) => {
      if (data && !apiStale) {
        homeSectionsMemory[locale] = data;
        writeCachedHomeSections(locale, data);
      }
      return apiStale ? null : data;
    })
    .catch(() => null)
    .finally(() => {
      delete homeSectionsInflight[locale];
    });
  return homeSectionsInflight[locale];
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
  const [clientHomeSections, setClientHomeSections] = useState(() => ({ ...homeSectionsMemory }));

  useEffect(() => {
    setLocaleState(readLangCookie());
    setMounted(true);
  }, []);

  // When the page didn't supply home sections via getStaticProps, fill them in from
  // cache immediately and refresh from the CMS in the background (never blocking render).
  // Only en/sw home copy is managed in the CMS (same as before); other locales use en.
  const activeLocale = mounted && HOME_SECTION_LOCALES.includes(locale) ? locale : 'en';
  useEffect(() => {
    if (!mounted || homeSectionsByLocale?.[activeLocale]) return undefined;
    let cancelled = false;
    const cached = readCachedHomeSections()[activeLocale];
    if (cached?.data && !homeSectionsMemory[activeLocale]) {
      homeSectionsMemory[activeLocale] = cached.data;
      setClientHomeSections((prev) => ({ ...prev, [activeLocale]: cached.data }));
    }
    const fresh = cached && Date.now() - cached.at < HOME_SECTIONS_MAX_AGE_MS;
    if (!fresh) {
      loadHomeSections(activeLocale).then((data) => {
        if (!cancelled && data) setClientHomeSections((prev) => ({ ...prev, [activeLocale]: data }));
      });
    }
    return () => { cancelled = true; };
  }, [mounted, activeLocale, homeSectionsByLocale]);

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
      homeSectionsByLocale: {
        en: fallbackHomeSections,
        ...clientHomeSections,
        ...(homeSectionsByLocale || {}),
      },
      heroByLocale,
    }),
    [mounted, locale, setLocale, siteHeaderByLocale, homeSectionsByLocale, clientHomeSections, heroByLocale]
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
