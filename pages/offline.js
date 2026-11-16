import Head from 'next/head';
import Link from 'next/link';
import { Box } from '@mui/material';
import StatusPage, { statusPageProps } from '../components/StatusPage';
import TollFreeLines from '../components/TollFreeLines';
import { useT } from '../contexts/LanguageContext';

const FALLBACK = {
  title: 'You are offline',
  text: 'This page is not saved on this device yet. Pages you opened before still work without a connection. Try again when you are back online.',
  button: { label: 'Go to the home page', href: '/' },
};

/** Shown by the app (service worker) when a page isn't saved on the device and there is no connection. */
export default function Offline({ pageByLocale }) {
  const t = useT();
  return (
    <>
      <Head><meta name="robots" content="noindex" /></Head>
      <StatusPage pageByLocale={pageByLocale} section="message" fallback={FALLBACK}>
        <Box sx={{ mt: 3 }}>
          <Link href="/saved" style={{ color: '#2E7BB4', fontWeight: 600 }}>{t('offline.saved_title')}</Link>
        </Box>
        {/* Emergency numbers work without a connection (saved with this page). */}
        <TollFreeLines sx={{ mt: 5, textAlign: 'left' }} />
      </StatusPage>
    </>
  );
}

export async function getStaticProps() {
  return { props: { pageByLocale: await statusPageProps('offline') }, revalidate: 3600 };
}
