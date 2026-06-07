import App from 'next/app';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import { SiteHeaderContext } from '../contexts/SiteHeaderContext';
import { getSiteHeader } from '../lib/wordpress';
import { fallbackSiteHeader } from '../lib/fallback-data';

export default function MyApp({ Component, pageProps, siteHeader }) {
  return (
    <SiteHeaderContext.Provider value={siteHeader || fallbackSiteHeader}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </SiteHeaderContext.Provider>
  );
}

MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  const { data } = await getSiteHeader();
  return { ...appProps, siteHeader: data };
};
