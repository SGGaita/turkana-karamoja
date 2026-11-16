import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, Button, Container, Typography } from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import Layout from '../components/Layout';
import OfflineDownload from '../components/OfflineDownload';
import { useT } from '../contexts/LanguageContext';
import { checkSavedFiles, formatSavedAt, removeFile, savedFiles } from '../lib/offline';

function size(bytes) {
  if (!bytes) return '';
  return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Documents saved on this device with "Save for offline" (FE-09). Works without a connection. */
export default function Saved() {
  const t = useT();
  const [files, setFiles] = useState(null);

  useEffect(() => {
    const sync = () => setFiles(savedFiles());
    sync();
    checkSavedFiles().then(setFiles).catch(() => {});
    window.addEventListener('kc-saved-files', sync);
    return () => window.removeEventListener('kc-saved-files', sync);
  }, []);

  return (
    <Layout title={t('offline.saved_title')} noindex>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography component="h1" sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 800, color: '#3D2B1F', mb: 1 }}>
          {t('offline.saved_title')}
        </Typography>
        <Typography sx={{ color: '#6B4226', mb: 3 }}>{t('offline.saved_intro')}</Typography>

        {files && files.length === 0 && (
          <Typography sx={{ color: '#6B6B6B', py: 3 }}>{t('offline.saved_empty')}</Typography>
        )}

        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gap: 1.5 }}>
          {(files || []).map((f) => (
            <Box
              component="li"
              key={f.local}
              sx={{ bgcolor: 'white', border: '1px solid #F0EBE3', borderRadius: 2, p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}
            >
              <DescriptionOutlinedIcon sx={{ color: '#C1440E' }} />
              <Box sx={{ flex: '1 1 240px', minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, color: '#3D2B1F' }}>
                  {f.reportPath ? <Link href={f.reportPath} style={{ color: 'inherit' }}>{f.title || f.label}</Link> : (f.title || f.label)}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A' }}>
                  {[f.label, size(f.size), t('offline.saved_on', { date: formatSavedAt(f.savedAt) })].filter(Boolean).join(' · ')}
                </Typography>
              </Box>
              <Button variant="contained" size="small" href={f.local} target="_blank" rel="noopener" sx={{ bgcolor: '#3D2B1F', '&:hover': { bgcolor: '#C1440E' } }}>
                {t('offline.open')}
              </Button>
              <Button size="small" onClick={() => removeFile(f.local)} sx={{ color: '#6B4226', textTransform: 'none' }}>
                {t('offline.remove_file')}
              </Button>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 4, p: 2, borderRadius: 2, bgcolor: '#3D2B1F' }}>
          <OfflineDownload hideSavedLink />
        </Box>
      </Container>
    </Layout>
  );
}

export async function getStaticProps() {
  return { props: {} };
}
