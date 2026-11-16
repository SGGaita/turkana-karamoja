import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import DownloadForOfflineOutlinedIcon from '@mui/icons-material/DownloadForOfflineOutlined';
import OfflinePinIcon from '@mui/icons-material/OfflinePin';
import { localFileUrl, removeFile, saveFile, savedFiles } from '../lib/offline';
import { useT } from '../contexts/LanguageContext';

/** "Save for offline" next to a report document (FE-09). Hidden where it can't work (no service worker, not a CMS upload). */
export default function SaveForOffline({ file, report, reportPath }) {
  const t = useT();
  const local = localFileUrl(file?.url);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || typeof caches === 'undefined' || !local) return undefined;
    setReady(true);
    const sync = () => setSaved(savedFiles().some((f) => f.local === local));
    sync();
    window.addEventListener('kc-saved-files', sync);
    return () => window.removeEventListener('kc-saved-files', sync);
  }, [local]);

  if (!ready) return null;

  const onClick = async () => {
    setBusy(true);
    setFailed(false);
    try {
      if (saved) await removeFile(local);
      else {
        await saveFile({
          url: file.url,
          title: report?.title || '',
          label: [file.label || file.language, file.filename].filter(Boolean).join(' · '),
          reportPath,
        });
      }
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      size="small"
      variant="text"
      onClick={onClick}
      disabled={busy}
      title={failed ? t('offline.save_failed') : undefined}
      startIcon={saved ? <OfflinePinIcon sx={{ fontSize: 14 }} /> : <DownloadForOfflineOutlinedIcon sx={{ fontSize: 14 }} />}
      sx={{ fontSize: '0.68rem', py: 0.3, color: failed ? '#C1440E' : saved ? '#2E8B57' : '#3D2B1F', textTransform: 'none' }}
    >
      {busy ? t('offline.saving_file') : failed ? t('offline.save_failed') : saved ? t('offline.remove_file') : t('offline.save_file')}
    </Button>
  );
}
