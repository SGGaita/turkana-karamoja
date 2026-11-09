import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise = null;
function loadScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onload = () => resolve(window.turnstile);
      s.onerror = () => { scriptPromise = null; reject(new Error('Turnstile failed to load')); };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

/** Whether a captcha is shown at all (NEXT_PUBLIC_TURNSTILE_SITE_KEY set). Without it the CMS accepts forms on local sites only. */
export const captchaEnabled = Boolean(SITE_KEY);

/**
 * Cloudflare Turnstile widget. Calls onToken(token) when solved and onToken('') when it expires.
 * Pass a changing `resetKey` to get a fresh challenge (tokens are single use).
 */
export default function Turnstile({ onToken, resetKey = 0 }) {
  const ref = useRef(null);
  const widgetId = useRef(null);

  useEffect(() => {
    if (!SITE_KEY) return undefined;
    let cancelled = false;
    loadScript()
      .then((ts) => {
        if (cancelled || !ref.current) return;
        if (widgetId.current !== null) ts.remove(widgetId.current);
        widgetId.current = ts.render(ref.current, {
          sitekey: SITE_KEY,
          callback: (token) => onToken?.(token),
          'expired-callback': () => onToken?.(''),
          'error-callback': () => onToken?.(''),
        });
      })
      .catch(() => onToken?.(''));
    return () => {
      cancelled = true;
      if (widgetId.current !== null && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  if (!SITE_KEY) return null;
  return <Box ref={ref} sx={{ my: 1.5, minHeight: 65 }} />;
}
