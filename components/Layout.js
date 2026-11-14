import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';
import OfflineIndicator from './OfflineIndicator';
import SeoHead from './SeoHead';
import { Box } from '@mui/material';
import { useShell } from '../contexts/LanguageContext';
import { APP_FULL_NAME, APP_PAGE_TITLE_SUFFIX, APP_META_DESCRIPTION } from '../lib/branding';

/**
 * Page shell. SEO: `type` is the Open Graph type ("article" for alerts, reports and initiatives), `image` a share
 * image, `noindex` keeps the page out of search engines, `jsonLd` adds structured data.
 */
export default function Layout({ children, title = APP_FULL_NAME, description, type = 'website', image = '', noindex = false, jsonLd = null }) {
  const seo = useShell()?.seo;
  const metaDescription = description || seo?.description || APP_META_DESCRIPTION;
  return (
    <>
      <Head>
        <title>{`${title} | ${APP_PAGE_TITLE_SUFFIX}`}</title>
        <meta name="description" content={metaDescription} key="description" />
        <meta property="og:title" content={`${title} | ${APP_PAGE_TITLE_SUFFIX}`} key="og:title" />
        <meta property="og:description" content={metaDescription} key="og:description" />
        <meta name="theme-color" content="#C1440E" key="theme-color" />
      </Head>
      <SeoHead type={type} image={image} noindex={noindex} jsonLd={jsonLd} />
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
