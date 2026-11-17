// Montserrat ships with the website (no request to Google Fonts): it works offline from the first visit, needs no
// third-party font host in the security headers, and pages don't redraw when the font arrives late.
import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import { LanguageProvider } from '../contexts/LanguageContext';
import ShellHead from '../components/ShellHead';
import { OfflineProvider } from '../contexts/OfflineContext';
import { InstallProvider } from '../contexts/InstallContext';
import AnalyticsConsent from '../components/AnalyticsConsent';
import { useEffect } from 'react';
import { startMonitoring } from '../lib/monitoring';
import '../styles/maps.css';

// NOTE: no getInitialProps here on purpose. A getInitialProps on _app runs on EVERY
// client-side navigation and blocks the route change until it resolves — with a slow CMS
// that made every menu click take ~20 s. It also disables static optimisation for all pages.
// Shared CMS content (home sections / footer) is now loaded lazily in LanguageProvider,
// or passed in via a page's getStaticProps (see pages/index.js).
export default function MyApp({ Component, pageProps }) {
  // Error monitoring (FE-27): nothing loads unless NEXT_PUBLIC_SENTRY_DSN is set.
  useEffect(() => startMonitoring(), []);
  return (
    <LanguageProvider
      homeSectionsByLocale={pageProps.homeSectionsByLocale || null}
      heroByLocale={pageProps.heroByLocale || null}
      untranslated={pageProps.untranslatedByLocale || pageProps.pageByLocale || null}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ShellHead />
        <InstallProvider>
          <OfflineProvider>
            <Component {...pageProps} />
            <AnalyticsConsent />
          </OfflineProvider>
        </InstallProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
