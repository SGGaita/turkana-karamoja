import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import Layout from './Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { pickLocale } from '../lib/cms-alerts';

const str = (v) => (typeof v === 'string' ? v : '');

/**
 * A short message page (offline, page not found, server error). Text from Karamoja → Website pages (`page`, section
 * `section`) once saved, else `fallback` ({ title, text, button: { label, href } }).
 */
export default function StatusPage({ pageByLocale, section, fallback, code }) {
  const { locale } = useLanguage();
  const saved = pickLocale(pageByLocale, locale)?.sections?.[section];
  const msg = saved && saved.enabled !== false ? saved : fallback;
  const title = str(msg?.title) || fallback.title;
  const button = msg?.button && str(msg.button.href) ? msg.button : (saved ? null : fallback.button);
  // Only site paths and http(s) addresses.
  const href = button && /^(\/(?!\/)|https?:\/\/)/i.test(str(button.href)) ? str(button.href) : '';

  return (
    <Layout title={title}>
      <Box sx={{ maxWidth: 640, mx: 'auto', px: 2, py: { xs: 8, md: 12 }, textAlign: 'center' }}>
        {code && <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 800, fontSize: '3rem', color: '#D4A96A', lineHeight: 1 }}>{code}</Typography>}
        <Typography component="h1" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: { xs: '1.6rem', md: '2rem' }, color: '#3D2B1F', mt: 2, mb: 1.5 }}>{title}</Typography>
        {str(msg?.text) && <Typography sx={{ fontSize: '1rem', color: '#5A5A5A', lineHeight: 1.7, mb: 4 }}>{msg.text}</Typography>}
        {href && (
          <Button component={Link} href={href} variant="contained" disableElevation sx={{ bgcolor: '#C1440E', '&:hover': { bgcolor: '#A33A0C' }, textTransform: 'none', px: 4 }}>
            {str(button.label) || fallback.button.label}
          </Button>
        )}
      </Box>
    </Layout>
  );
}

/** Website pages → page in every language, or null (never saved / Core not reachable). */
export async function statusPageProps(page) {
  try {
    const { getPageAllLocales, isPublishedPage } = await import('../lib/cms');
    const pages = await getPageAllLocales(page);
    return isPublishedPage(pages?.en) ? pages : null;
  } catch {
    return null;
  }
}
