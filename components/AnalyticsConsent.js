import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Paper, Slide, Typography } from '@mui/material';
import { useLanguage, useShell, useT } from '../contexts/LanguageContext';
import {
  noAnalyticsPage, readConsent, setAnalyticsLanguage, startAnalytics, stopAnalytics, writeConsent,
} from '../lib/analytics';
import LinkBehavior from './LinkBehavior';

/** Tells the install offer (contexts/InstallContext.js) to wait while the question is on screen. */
function announce(open) {
  window.__kcConsentOpen = open;
  window.dispatchEvent(new Event(open ? 'kc-consent-open' : 'kc-consent-closed'));
}

/**
 * The analytics question (FE-27), shown when Site settings → Analytics has a measurement ID and the visitor has not
 * answered. "Accept" starts Google Analytics; "Decline" keeps it off. Footer → "Analytics settings" asks again.
 */
export default function AnalyticsConsent() {
  const t = useT();
  const router = useRouter();
  const { locale } = useLanguage();
  const analytics = useShell()?.analytics;
  const id = analytics?.ga4Id || '';
  const [open, setOpen] = useState(false);
  const skip = noAnalyticsPage(router?.pathname);

  // An earlier "Accept" starts counting on every page (but never on pages from password emails).
  useEffect(() => {
    if (!id || skip) return;
    const choice = readConsent();
    if (choice === 'granted') startAnalytics(id, { language: locale });
    else if (!choice) setOpen(true);
  }, [id, skip, locale]);

  useEffect(() => {
    setAnalyticsLanguage(locale);
  }, [locale]);

  useEffect(() => {
    if (!id) return undefined;
    const ask = () => setOpen(true);
    window.addEventListener('kc-consent-ask', ask);
    return () => window.removeEventListener('kc-consent-ask', ask);
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined') announce(open);
  }, [open]);

  const choose = useCallback((choice) => {
    writeConsent(choice);
    setOpen(false);
    if (choice === 'granted') startAnalytics(id, { language: locale });
    else stopAnalytics();
  }, [id, locale]);

  if (!id || skip) return null;
  return (
    <Slide direction="up" in={open} mountOnEnter unmountOnExit>
      <Paper
        role="region"
        aria-labelledby="kc-consent-title"
        elevation={8}
        sx={{
          position: 'fixed', zIndex: 1450, left: 0, right: 0, mx: 'auto',
          bottom: { xs: 0, sm: 24 }, width: { xs: 'auto', sm: 520 },
          borderRadius: { xs: '16px 16px 0 0', sm: 3 }, p: 2.5, pb: { xs: 'calc(20px + env(safe-area-inset-bottom))', sm: 2.5 },
          bgcolor: '#FFFDF8', borderTop: '3px solid #2E7BB4',
        }}
      >
        <Typography id="kc-consent-title" sx={{ fontWeight: 800, fontSize: '1rem', color: '#3D2B1F' }}>
          {t('consent.title')}
        </Typography>
        <Typography sx={{ mt: 0.75, fontSize: '0.88rem', color: '#6B4226', lineHeight: 1.55 }}>
          {t('consent.text')}{' '}
          {analytics?.privacy?.href && (
            <Box component={LinkBehavior} href={analytics.privacy.href} sx={{ color: '#C1440E', fontWeight: 600 }}>
              {t('consent.privacy')}
            </Box>
          )}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.75 }}>
          {/* Equal weight: declining is as easy as accepting. */}
          <Button variant="outlined" onClick={() => choose('denied')} sx={{ textTransform: 'none', fontWeight: 700, color: '#3D2B1F', borderColor: '#3D2B1F' }}>
            {t('consent.decline')}
          </Button>
          <Button variant="contained" onClick={() => choose('granted')} sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#3D2B1F', '&:hover': { bgcolor: '#5A4030' } }}>
            {t('consent.accept')}
          </Button>
        </Box>
      </Paper>
    </Slide>
  );
}
