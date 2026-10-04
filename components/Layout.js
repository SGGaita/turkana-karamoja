import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';
import OfflineIndicator from './OfflineIndicator';
import { Box } from '@mui/material';
import { APP_FULL_NAME, APP_PAGE_TITLE_SUFFIX, APP_META_DESCRIPTION } from '../lib/branding';

export default function Layout({ children, title = APP_FULL_NAME, description }) {
  const metaDescription = description || APP_META_DESCRIPTION;
  return (
    <>
      <Head>
        <title>{`${title} | ${APP_PAGE_TITLE_SUFFIX}`}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`${title} | ${APP_PAGE_TITLE_SUFFIX}`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#C1440E" />
      </Head>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FDF6EC' }}>
        <OfflineIndicator />
        <Navbar />
        <Box component="main" sx={{ flex: 1 }}>
          {children}
        </Box>
        <Footer />
      </Box>
    </>
  );
}
