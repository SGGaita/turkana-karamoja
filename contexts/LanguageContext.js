import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { DEFAULT_SITE_HEADER as fallbackSiteHeader, DEFAULT_HOME_SECTIONS as fallbackHomeSections } from '../lib/defaults';
import siteHeaderSnapshot from '../lib/site-header.snapshot.json';
import { cmsLocale, getGlobals } from '../lib/cms';
import { shellFromGlobals } from '../lib/cms-globals';
import { translate } from '../lib/ui-strings';
import { DEFAULT_LOCALE, LOCALE_COOKIE, OLD_LOCALE_COOKIE, SITE_LOCALES, localePath, siteLocale } from '../lib/locales';

/** Address languages (FE-26): the page's language is its address (/sw/…), not a cookie. */
export const SUPPORTED_LOCALES = SITE_LOCALES;

/** Remembers the choice for the next visit (middleware.js sends English addresses there). */
function rememberLocale(locale) {
  if (typeof document === 'undefined') return;
  const year = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)};path=/;max-age=${year};SameSite=Lax`;
  document.cookie = `${OLD_LOCALE_COOKIE}=;path=/;max-age=0;SameSite=Lax`;
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
  addressLocale: 'en',
  readyLocales: ['en'],
  pageUntranslated: false,
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
  untranslated = null,
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // The address decides the language, on the server too: the first paint is already in that language.
  const activeLocale = siteLocale(router?.locale) || DEFAULT_LOCALE;
  const cmsLoc = cmsLocale(activeLocale);
  const clientGlobals = useCmsContent(globalsLoader, cmsLoc, mounted);

  // The installed app's name in the visitor's language (FE-08): browsers read the manifest link when installing.
  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;
    const link = document.querySelector('link[rel="manifest"]');
    if (link) link.setAttribute('href', cmsLoc === 'en' ? '/manifest.webmanifest' : `/manifest.webmanifest?lang=${cmsLoc}`);
  }, [mounted, cmsLoc]);

  // The same page in another language: /reports → /sw/reports. Remembered for the next visit.
  const setLocale = useCallback(
    (nextLocale) => {
      const loc = siteLocale(nextLocale);
      if (!loc || !router) return;
      rememberLocale(loc);
      if (loc === activeLocale) return;
      router.push({ pathname: router.pathname, query: router.query }, router.asPath, { locale: loc, scroll: false });
    },
    [router, activeLocale]
  );

  const value = useMemo(() => {
    const headers = { en: fallbackSiteHeader }; // Built-in header until Site settings are saved.
    const globalsFor = (loc) => clientGlobals[loc] || SNAPSHOT_GLOBALS[loc] || clientGlobals.en || SNAPSHOT_GLOBALS.en || null;
    // Languages not marked ready in Site settings → Languages fall back to English.
    const offered = shellFromGlobals(globalsFor(cmsLoc))?.languages; // Every language's settings carry the list; the freshest copy wins.
    const allowed = !offered || offered.some((l) => l.code === activeLocale || l.cms === cmsLoc);
    const effective = allowed ? activeLocale : 'en';
    const ready = (offered || []).map((l) => l.code);
    const baseHeader = headers[effective] || headers.en || fallbackSiteHeader;
    const effectiveGlobals = globalsFor(cmsLocale(effective));
    const shell = shellFromGlobals(effectiveGlobals, baseHeader);
    const uiStrings = effectiveGlobals?.ui_strings || null; // Interface text: works before Site settings are saved.
    return {
      locale: effective,
      addressLocale: activeLocale,
      readyLocales: offered ? ready : SUPPORTED_LOCALES,
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

  // Does this page (Website pages) have text still in English in the reader's language? (FE-26: note in the header.)
  // `untranslated` is the page's pageByLocale (each language's answer lists `_untranslated` fields) or, for Home,
  // untranslatedByLocale (the lists only).
  const pageUntranslated = useMemo(() => {
    const cms = cmsLocale(value.locale);
    if (cms === 'en' || !untranslated) return false;
    const entry = untranslated[cms];
    const list = Array.isArray(entry) ? entry : entry?._untranslated;
    return Array.isArray(list) && list.length > 0;
  }, [untranslated, value.locale]);

  // The remembered language, when an English address was answered from a saved copy (the service worker or the
  // browser's cache) instead of reaching middleware.js. Online only: offline, the other language may not be saved.
  useEffect(() => {
    if (!mounted || !router || activeLocale !== DEFAULT_LOCALE) return;
    // Read now, not at load: choosing English in the menu writes the cookie before moving to the English address.
    const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`));
    const remembered = siteLocale(decodeURIComponent(m?.[1] || ''));
    if (!remembered || remembered === DEFAULT_LOCALE || !value.readyLocales.includes(remembered)) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    router.replace({ pathname: router.pathname, query: router.query }, router.asPath, { locale: remembered, scroll: false });
  }, [mounted, router, activeLocale, value.readyLocales]);

  // A language not (or no longer) marked ready in Site settings → Languages: the English address instead.
  const notReady = value.locale !== activeLocale;
  useEffect(() => {
    if (!mounted || !notReady || !router) return;
    rememberLocale(DEFAULT_LOCALE);
    router.replace({ pathname: router.pathname, query: router.query }, router.asPath, { locale: DEFAULT_LOCALE });
  }, [mounted, notReady, router]);

  const provided = useMemo(() => ({ ...value, pageUntranslated }), [value, pageUntranslated]);
  return <LanguageContext.Provider value={provided}>{children}</LanguageContext.Provider>;
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
export function useVocabLabel(list) {
  const vocab = useShell()?.vocabularies?.[list];
  // Site settings → Lists; a code not (yet) in the list is shown readably ("non_functional" → "Non functional").
  return (code) => (vocab && vocab[code]) || humanizeCode(code);
}

export function humanizeCode(code) {
  const s = String(code || '').replace(/[_-]+/g, ' ').trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

/**
 * Interface text in the reader's language (Karamoja → Interface text), English fallback: `const t = useT(); t('alerts.source')`.
 */
export function useT() {
  return useLanguage().t;
}

/**
 * The address of a page in the reader's language, for plain links that don't go through Next.js's Link (a link that
 * opens a new tab): `const to = useLocalePath(); to('/help/x')` → '/sw/help/x'.
 */
export function useLocalePath() {
  const { addressLocale } = useLanguage();
  return (path) => localePath(path, addressLocale);
}
