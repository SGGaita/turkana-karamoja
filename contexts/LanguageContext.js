import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fallbackSiteHeader, fallbackHomeSections } from '../lib/fallback-data';
import siteHeaderSnapshot from '../lib/site-header.snapshot.json';
import { cmsLocale, getGlobals } from '../lib/cms';
import { shellFromGlobals } from '../lib/cms-globals';
import { translate } from '../lib/ui-strings';

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

// Karamoja → Site settings (header, footer, helplines, languages, interface text) is fetched in the background — never
// blocking navigation — and cached in memory for the session and in localStorage across visits. The copy saved into
// the build (scripts/fetch-site-header.js) renders first; the website's built-in defaults are the last resort.
const CMS_CACHE_MAX_AGE_MS = 1000 * 60 * 30;

function createCmsLoader(storageKey, fetcher, { refreshEachVisit = false } = {}) {
  const memory = {};
  const inflight = {};
  const refreshed = {};

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
      const isFresh = stored && Date.now() - stored.at < CMS_CACHE_MAX_AGE_MS && !(refreshEachVisit && !refreshed[locale]);
      if (!isFresh) {
        refreshed[locale] = true;
        fetchFresh(locale).then((data) => data && onFresh(data));
      }
      return memory[locale] || null;
    },
  };
}

// Karamoja → Site settings: checked once per visit so edits show on the next page load (cheap: ETag / 304).
const globalsLoader = createCmsLoader(
  'kc_globals_v1',
  // Kept before Site settings are saved too: interface text works from day one (the shell checks the save itself).
  (loc) => getGlobals(loc).then((data) => ({ data, apiStale: !data || typeof data !== 'object' })),
  { refreshEachVisit: true },
);
// Saved into the build by scripts/fetch-site-header.js, so the first paint already has the CMS header and footer.
const SNAPSHOT_GLOBALS = siteHeaderSnapshot?.globals || {};

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
  t: (key, vars) => translate(null, key, vars),
  locale: 'en',
  setLocale: () => {},
  siteHeaderByLocale: { en: fallbackSiteHeader, sw: fallbackSiteHeader },
  homeSectionsByLocale: { en: fallbackHomeSections, sw: fallbackHomeSections },
  heroByLocale: null,
  shell: null,
});

export function LanguageProvider({
  children,
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
  const cmsLoc = cmsLocale(activeLocale);
  const clientGlobals = useCmsContent(globalsLoader, cmsLoc, mounted);

  const setLocale = useCallback((nextLocale) => {
    if (!SUPPORTED_LOCALES.includes(nextLocale)) return;
    setLocaleState(nextLocale);
    writeLangCookie(nextLocale);
  }, []);

  const value = useMemo(() => {
    const headers = { en: fallbackSiteHeader }; // Built-in header until Site settings are saved.
    const globalsFor = (loc) => clientGlobals[loc] || SNAPSHOT_GLOBALS[loc] || clientGlobals.en || SNAPSHOT_GLOBALS.en || null;
    // Languages not marked ready in Site settings → Languages fall back to English.
    const offered = shellFromGlobals(globalsFor(cmsLoc))?.languages; // Every language's settings carry the list; the freshest copy wins.
    const allowed = !offered || offered.some((l) => l.code === activeLocale || l.cms === cmsLoc);
    const effective = allowed ? activeLocale : 'en';
    const baseHeader = headers[effective] || headers.en || fallbackSiteHeader;
    const effectiveGlobals = globalsFor(cmsLocale(effective));
    const shell = shellFromGlobals(effectiveGlobals, baseHeader);
    const uiStrings = effectiveGlobals?.ui_strings || null; // Interface text: works before Site settings are saved.
    return {
      locale: effective,
      setLocale,
      shell,
      t: (key, vars) => translate(uiStrings, key, vars),
      siteHeaderByLocale: shell ? { ...headers, [effective]: shell.header } : headers,
      homeSectionsByLocale: {
        en: fallbackHomeSections,
        ...(homeSectionsByLocale || {}), // The home page passes Website pages → Home in every language.
      },
      heroByLocale,
    };
  }, [activeLocale, cmsLoc, setLocale, homeSectionsByLocale, clientGlobals, heroByLocale]);

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

/** Header, footer, helplines, languages and SEO from Karamoja → Site settings, or null (old sources in use). */
export function useShell() {
  return useLanguage().shell;
}

/**
 * The label for a code from Site settings → Lists (e.g. useVocabLabel('water_point_types')('borehole')), falling back
 * to the website's built-in labels until Site settings are saved, then to the code itself.
 */
export function useVocabLabel(list, fallback = {}) {
  const vocab = useShell()?.vocabularies?.[list];
  return (code) => {
    const fromFallback = fallback[code];
    const builtIn = typeof fromFallback === 'object' && fromFallback ? fromFallback.label : fromFallback;
    return (vocab && vocab[code]) || builtIn || code || '';
  };
}

/**
 * Interface text in the reader's language (Karamoja → Interface text), English fallback: `const t = useT(); t('alerts.source')`.
 */
export function useT() {
  return useLanguage().t;
}
