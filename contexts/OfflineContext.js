import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Snackbar } from '@mui/material';
import {
  STATIC_ROUTES, connectionIsSlow, contentPaths, fetchOfflineManifest, isInstalled, needsContent, needsCore,
  readState, requestPersist, warm, writeState,
} from '../lib/offline';
import { useT } from './LanguageContext';
import OfflineIndicator from '../components/OfflineIndicator';

/**
 * Offline use (FE-09): saves pages for use without a connection, tells the visitor what is saved, and offers to
 * reload when a new version of the site is ready.
 */
const OfflineContext = createContext({
  online: true,
  slow: false,
  savedAt: null,
  progress: null,
  partly: false,
  supported: false,
  downloadForOffline: async () => {},
});

export function useOffline() {
  return useContext(OfflineContext);
}

function buildId() {
  return typeof window !== 'undefined' ? window.__NEXT_DATA__?.buildId || '' : '';
}

export function OfflineProvider({ children }) {
  const t = useT();
  const [online, setOnline] = useState(true);
  const [slow, setSlow] = useState(false);
  const [supported, setSupported] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [progress, setProgress] = useState(null); // { done, total } while saving content
  const [partly, setPartly] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const running = useRef(false);

  const saveContent = useCallback(async (manual) => {
    if (running.current) return;
    running.current = true;
    try {
      const id = buildId();
      let state = readState();
      if (needsCore(state, id)) {
        const done = await warm('core', STATIC_ROUTES, id);
        if (!done.stopped) state = writeState({ build: { id, at: done.at } });
      }
      const manifest = await fetchOfflineManifest();
      const paths = contentPaths(manifest);
      setProgress({ done: 0, total: paths.length });
      const done = await warm('content', paths, id, (m) => setProgress({ done: m.done, total: m.total }));
      state = writeState({
        content: { at: done.at, total: done.total, failed: done.failed, manual: Boolean(manual) },
        ...(manual ? { optIn: true } : {}),
      });
      setSavedAt(done.at);
      setPartly(done.failed > 0);
    } catch {
      setPartly(true);
    } finally {
      setProgress(null);
      running.current = false;
    }
  }, []);

  /** The "Download for offline use" button. */
  const downloadForOffline = useCallback(async () => {
    writeState({ optIn: true });
    await requestPersist();
    await saveContent(true);
  }, [saveContent]);

  // What to save on opening and when the connection comes back.
  const autoSave = useCallback(async () => {
    if (!navigator.onLine || running.current) return;
    const conn = navigator.connection;
    const isSlow = connectionIsSlow(conn);
    setSlow(isSlow);
    if (isSlow) return; // Only the button.
    const state = readState();
    const installed = isInstalled();
    if (needsContent(state, { installed })) {
      if (installed) requestPersist();
      await saveContent(false);
      return;
    }
    const id = buildId();
    if (needsCore(state, id) && !running.current) {
      running.current = true;
      try {
        const done = await warm('core', STATIC_ROUTES, id);
        if (!done.stopped) writeState({ build: { id, at: done.at } });
      } catch {
        /* Next time. */
      } finally {
        running.current = false;
      }
    }
  }, [saveContent]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || typeof caches === 'undefined') return undefined;
    setSupported(true);
    setOnline(navigator.onLine);
    const state = readState();
    setSavedAt(state.content?.at || state.build?.at || null);
    setSlow(connectionIsSlow(navigator.connection));

    const goOnline = () => {
      setOnline(true);
      autoSave();
    };
    const goOffline = () => setOnline(false);
    const installed = () => {
      writeState({ optIn: true });
      requestPersist();
      saveContent(false);
    };
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    window.addEventListener('appinstalled', installed);

    // Wait until the page has settled so saving doesn't compete with it.
    let timer = null;
    navigator.serviceWorker.ready.then(() => {
      timer = window.setTimeout(autoSave, 4000);
    });

    // New version: offer to reload (the worker waits: skipWaiting is off in next.config.js).
    const wb = window.workbox;
    const waiting = () => setUpdateReady(true);
    wb?.addEventListener('waiting', waiting);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('appinstalled', installed);
      wb?.removeEventListener('waiting', waiting);
      if (timer) window.clearTimeout(timer);
    };
  }, [autoSave, saveContent]);

  const reload = useCallback(() => {
    const wb = window.workbox;
    if (!wb) {
      window.location.reload();
      return;
    }
    wb.addEventListener('controlling', () => window.location.reload());
    wb.messageSkipWaiting();
  }, []);

  const value = useMemo(
    () => ({ online, slow, savedAt, progress, partly, supported, downloadForOffline }),
    [online, slow, savedAt, progress, partly, supported, downloadForOffline],
  );

  return (
    <OfflineContext.Provider value={value}>
      {/* On every page, including the home page and the portal, which have their own layouts. */}
      <OfflineIndicator />
      {children}
      <Snackbar
        open={updateReady}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={t('app.update_available')}
        action={(
          <Button color="warning" size="small" onClick={reload} sx={{ fontWeight: 700 }}>
            {t('app.reload')}
          </Button>
        )}
      />
    </OfflineContext.Provider>
  );
}
