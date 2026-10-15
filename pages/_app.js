import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import { LanguageProvider } from '../contexts/LanguageContext';

// NOTE: no getInitialProps here on purpose. A getInitialProps on _app runs on EVERY
// client-side navigation and blocks the route change until it resolves — with a slow CMS
// that made every menu click take ~20 s. It also disables static optimisation for all pages.
// Shared CMS content (home sections / footer) is now loaded lazily in LanguageProvider,
// or passed in via a page's getStaticProps (see pages/index.js).
export default function MyApp({ Component, pageProps }) {
  return (
    <LanguageProvider
      homeSectionsByLocale={pageProps.homeSectionsByLocale || null}
      heroByLocale={pageProps.heroByLocale || null}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </LanguageProvider>
  );
}
