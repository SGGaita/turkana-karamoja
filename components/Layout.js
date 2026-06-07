import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';
import OfflineIndicator from './OfflineIndicator';
import { Box } from '@mui/material';

export default function Layout({ children, title = 'Turkana–Karamoja Climate Hub' }) {
  return (
    <>
      <Head>
        <title>{`${title} | TK Climate Hub`}</title>
        <meta name="description" content="Kenya · Uganda · Cross-Border Climate Intelligence Platform" />
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
