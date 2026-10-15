import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fallbackSiteHeader, fallbackHomeSections } from '../lib/fallback-data';
import { getHomeSections, getSiteHeader } from '../lib/wordpress';

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

// Shared CMS content (site header: logo/menu/topbar; home sections: footer/about copy) is
// fetched in the background — never blocking navigation. Cached in memory for the session
// and in localStorage across visits; bundled fallback content renders until the CMS answers.
const CMS_CACHE_MAX_AGE_MS = 1000 * 60 * 30;
const HOME_SECTION_LOCALES = ['en', 'sw'];

function createCmsLoader(storageKey, fetcher) {
  const memory = {};
  const inflight = {};

  const readStore = () => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const writeStore = (locale, data) => {
    try {
      const all = readStore();
      all[locale] = { data, at: Date.now() };
      window.localStorage.setItem(storageKey, JSON.stringify(all));
    } catch {
      /* storage unavailable — memory cache still works */
    }
  };

  const fetchFresh = (locale) => {
    if (!inflight[locale]) {
      inflight[locale] = fetcher(locale)
        .then(({ data, apiStale }) => {
          if (!data || apiStale) return null;
          memory[locale] = data;
          writeStore(locale, data);
          return data;
        })
        .catch(() => null)
        .finally(() => { delete inflight[locale]; });
    }
    return inflight[locale];
  };

  return {
    memory,
    /** Returns cached data now (or null) and calls onFresh later if the CMS returns newer data. */
    get(locale, onFresh) {
      const stored = readStore()[locale];
      if (stored?.data && !memory[locale]) memory[locale] = stored.data;
      const isFresh = stored && Date.now() - stored.at < CMS_CACHE_MAX_AGE_MS;
      if (!isFresh) fetchFresh(locale).then((data) => data && onFresh(data));
      return memory[locale] || null;
    },
  };
}

const siteHeaderLoader = createCmsLoader('tk_hub_site_header_v1', getSiteHeader);
const homeSectionsLoader = createCmsLoader('tk_hub_home_sections_v1', getHomeSections);

function useCmsContent(loader, locale, enabled) {
  const [byLocale, setByLocale] = useState(() => ({ ...loader.memory }));
  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    const cached = loader.get(locale, (fresh) => {
      if (!cancelled) setByLocale((prev) => ({ ...prev, [locale]: fresh }));
    });
    if (cached) setByLocale((prev) => (prev[locale] === cached ? prev : { ...prev, [locale]: cached }));
    return () => { cancelled = true; };
  }, [loader, locale, enabled]);
  return byLocale;
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

  const activeLocale = mounted ? locale : 'en';
  // Only en/sw home copy is managed in the CMS; other locales use en (as before).
  const homeLocale = HOME_SECTION_LOCALES.includes(activeLocale) ? activeLocale : 'en';
  const clientSiteHeader = useCmsContent(
    siteHeaderLoader, activeLocale, mounted && !siteHeaderByLocale?.[activeLocale],
  );
  const clientHomeSections = useCmsContent(
    homeSectionsLoader, homeLocale, mounted && !homeSectionsByLocale?.[homeLocale],
  );

  const setLocale = useCallback((nextLocale) => {
    if (!SUPPORTED_LOCALES.includes(nextLocale)) return;
    setLocaleState(nextLocale);
    writeLangCookie(nextLocale);
  }, []);

  const value = useMemo(
    () => ({
      locale: mounted ? locale : 'en',
      setLocale,
      siteHeaderByLocale: {
        en: fallbackSiteHeader,
        ...clientSiteHeader,
        ...(siteHeaderByLocale || {}),
      },
      homeSectionsByLocale: {
        en: fallbackHomeSections,
        ...clientHomeSections,
        ...(homeSectionsByLocale || {}),
      },
      heroByLocale,
    }),
    [mounted, locale, setLocale, siteHeaderByLocale, homeSectionsByLocale, clientSiteHeader, clientHomeSections, heroByLocale]
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
