import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, IconButton, Paper, Slide, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IosShareIcon from '@mui/icons-material/IosShare';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useT } from './LanguageContext';
import { isInstalled } from '../lib/offline';
import { headIcons } from '../lib/pwa';
import pwaSnapshot from '../lib/pwa.snapshot.json';
import {
  countVisit, decide, dismiss, isIos, promptSettings, readInstallState, track, writeInstallState,
} from '../lib/install';

/**
 * Install offer (FE-10). Chrome / Edge / Android: the browser's install dialog behind our own Install / Later sheet.
 * iPhone / iPad: a sheet with the Share → Add to Home Screen steps. When and where it appears comes from Site settings
 * → Install and offline. Also behind the permanent "Install app" buttons (menu, footer) and the iPhone push hint.
 */

// The browser announces installability once, often before React has started: keep it from the first moment.
let deferredPrompt = null;
const promptListeners = new Set();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Our sheet instead of the brief mini-infobar.
    deferredPrompt = e;
    promptListeners.forEach((fn) => fn(e));
  });
}

const InstallContext = createContext({ canInstall: false, ios: false, openInstall: () => {} });

export function useInstall() {
  return useContext(InstallContext);
}

const icon = headIcons(pwaSnapshot).appleTouchIcon;

async function liveSettings() {
  const base = String(process.env.NEXT_PUBLIC_WP_BASE_URL || '').replace(/\/$/, '');
  if (!base) return null;
  try {
    const res = await fetch(`${base}/wp-json/karamoja/v1/pwa`, { signal: AbortSignal.timeout(6000) });
    return res.ok ? (await res.json()).install_prompt || null : null;
  } catch {
    return null;
  }
}

export function InstallProvider({ children }) {
  const t = useT();
  const router = useRouter();
  const [promptEvent, setPromptEvent] = useState(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(true); // Until checked in the browser.
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState('auto');
  const [settings, setSettings] = useState(() => promptSettings(pwaSnapshot?.pwa?.install_prompt));
  const shownThisPage = useRef(false);
  const hideTimer = useRef(null);

  const canInstall = !installed && (Boolean(promptEvent) || ios);

  // Device facts, the visit count and the current settings.
  useEffect(() => {
    setInstalled(isInstalled());
    setIos(isIos(navigator.userAgent || '', navigator.maxTouchPoints || 0));
    setPromptEvent(deferredPrompt);
    const onPrompt = (e) => setPromptEvent(e);
    promptListeners.add(onPrompt);
    writeInstallState(countVisit(readInstallState()));
    const onInstalled = () => {
      setInstalled(true);
      setOpen(false);
      writeInstallState({ ...readInstallState(), installedAt: Date.now() });
      track('app_installed');
    };
    window.addEventListener('appinstalled', onInstalled);
    liveSettings().then((s) => s && setSettings(promptSettings(s)));
    return () => {
      promptListeners.delete(onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const show = useCallback((why) => {
    setSource(why);
    setOpen(true);
    shownThisPage.current = true;
    track('install_prompt_shown', { source: why, platform: ios ? 'ios' : 'browser' });
  }, [ios]);

  // Offered by itself, by the settings.
  useEffect(() => {
    if (!canInstall || open || shownThisPage.current) return undefined;
    const verdict = decide({
      settings, state: readInstallState(), path: router.asPath, canInstall, installed,
    });
    if (verdict === 'show') {
      const id = window.setTimeout(() => show('auto'), 2500); // Let the page settle first.
      return () => window.clearTimeout(id);
    }
    if (verdict === 'after30s') {
      const id = window.setTimeout(() => show('auto'), 30000);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [canInstall, installed, open, router.asPath, settings, show]);

  // "Hide after N seconds" (0 = until the visitor chooses). Hiding this way is not a "Later".
  useEffect(() => {
    if (!open || source !== 'auto' || !settings.seconds) return undefined;
    hideTimer.current = window.setTimeout(() => setOpen(false), settings.seconds * 1000);
    return () => window.clearTimeout(hideTimer.current);
  }, [open, source, settings.seconds]);

  const later = useCallback(() => {
    setOpen(false);
    if (source === 'auto') writeInstallState(dismiss(readInstallState(), settings));
    track('install_prompt_dismissed', { source, platform: ios ? 'ios' : 'browser' });
  }, [ios, settings, source]);

  const install = useCallback(async (why = source) => {
    const e = promptEvent || deferredPrompt;
    if (!e) return;
    setOpen(false);
    try {
      e.prompt();
      const choice = await e.userChoice;
      if (choice?.outcome === 'accepted') track('install_prompt_accepted', { source: why });
      else {
        if (why === 'auto') writeInstallState(dismiss(readInstallState(), settings));
        track('install_prompt_dismissed', { source: why, platform: 'browser', step: 'browser_dialog' });
      }
    } catch {
      /* The browser refused (already used): its own menu still offers Install. */
    }
    deferredPrompt = null;
    setPromptEvent(null);
  }, [promptEvent, settings, source]);

  /** For the "Install app" buttons and the iPhone push hint. */
  const openInstall = useCallback((why = 'button') => {
    if (installed) return;
    if (!ios && (promptEvent || deferredPrompt)) {
      setSource(why);
      track('install_prompt_shown', { source: why, platform: 'browser' });
      install(why);
      return;
    }
    if (ios) show(why);
  }, [install, installed, ios, promptEvent, show]);

  const value = useMemo(() => ({ canInstall, ios, openInstall }), [canInstall, ios, openInstall]);

  const step = (Icon, text) => (
    <Box component="li" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}>
      <Icon sx={{ color: '#2E7BB4', fontSize: 26, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.92rem', color: '#3D2B1F' }}>{text}</Typography>
    </Box>
  );

  return (
    <InstallContext.Provider value={value}>
      {children}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          role="dialog"
          aria-labelledby="kc-install-title"
          elevation={8}
          sx={{
            // Centred with margins, not transform (the slide animation owns transform).
            position: 'fixed', zIndex: 1400, left: 0, right: 0, mx: 'auto',
            bottom: { xs: 0, sm: 24 }, width: { xs: 'auto', sm: 460 },
            borderRadius: { xs: '16px 16px 0 0', sm: 3 }, p: 2.5, pb: { xs: 'calc(20px + env(safe-area-inset-bottom))', sm: 2.5 },
            bgcolor: '#FFFDF8', borderTop: '3px solid #C1440E',
          }}
        >
          <IconButton onClick={later} aria-label={t('install.later')} size="small" sx={{ position: 'absolute', top: 8, right: 8, color: '#6B4226' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', pr: 4 }}>
            <Box component="img" src={icon} alt="" width={48} height={48} sx={{ borderRadius: 2, flexShrink: 0 }} />
            <Typography id="kc-install-title" sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#3D2B1F', lineHeight: 1.25 }}>
              {ios ? t('install.ios_title') : t('install.title')}
            </Typography>
          </Box>
          <Typography sx={{ mt: 1.25, fontSize: '0.9rem', color: '#6B4226' }}>{t('install.text')}</Typography>
          {ios ? (
            <>
              <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0, mt: 1.5 }}>
                {step(IosShareIcon, t('install.ios_step_share'))}
                {step(AddBoxOutlinedIcon, t('install.ios_step_add'))}
                {step(CheckCircleOutlineIcon, t('install.ios_step_done'))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
                <Button onClick={later} sx={{ color: '#6B4226', textTransform: 'none', fontWeight: 600 }}>{t('install.later')}</Button>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button onClick={later} sx={{ color: '#6B4226', textTransform: 'none', fontWeight: 600 }}>{t('install.later')}</Button>
              <Button
                variant="contained"
                onClick={() => install(source)}
                sx={{ bgcolor: '#C1440E', textTransform: 'none', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#9E370B' } }}
              >
                {t('install.button')}
              </Button>
            </Box>
          )}
        </Paper>
      </Slide>
    </InstallContext.Provider>
  );
}

/** "Install app": only where installing is possible (and never inside the installed app). */
export function InstallAppButton({ sx, variant = 'outlined', size = 'small' }) {
  const { canInstall, openInstall } = useInstall();
  const t = useT();
  if (!canInstall) return null;
  return (
    <Button variant={variant} size={size} onClick={() => openInstall('button')} sx={{ textTransform: 'none', ...sx }}>
      {t('install.app_button')}
    </Button>
  );
}
