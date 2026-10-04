import App from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import { LanguageProvider, SUPPORTED_LOCALES } from '../contexts/LanguageContext';
import { getSiteHeader, getHomeSections } from '../lib/wordpress';
import { fallbackSiteHeader, fallbackHomeSections } from '../lib/fallback-data';

export default function MyApp({ Component, pageProps, siteHeaderByLocale, homeSectionsByLocale }) {
  return (
    <LanguageProvider
      siteHeaderByLocale={siteHeaderByLocale}
      homeSectionsByLocale={homeSectionsByLocale}
      heroByLocale={pageProps.heroByLocale || null}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </LanguageProvider>
  );
}

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  const headerResults = await Promise.all(
    SUPPORTED_LOCALES.map((locale) => getSiteHeader(locale))
  );
  const [homeEn, homeSw] = await Promise.all([
    getHomeSections('en'),
    getHomeSections('sw'),
  ]);

  const siteHeaderByLocale = SUPPORTED_LOCALES.reduce((acc, locale, index) => {
    acc[locale] = headerResults[index]?.data || fallbackSiteHeader;
    return acc;
  }, {});

  return {
    ...appProps,
    siteHeaderByLocale,
    homeSectionsByLocale: {
      en: homeEn.data || fallbackHomeSections,
      sw: homeSw.data || fallbackHomeSections,
    },
  };
};
