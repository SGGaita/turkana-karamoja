/**
 * Error monitoring in the browser (FE-27). With NEXT_PUBLIC_SENTRY_DSN set, the Sentry browser SDK is loaded once the
 * page has settled (it is not in the page's own code); errors from before that are kept and sent when it arrives.
 * Without a DSN nothing is loaded. Errors only: no performance tracing, session replay or session counting.
 */
import { monitoringDsn, monitoringEnvironment, scrubBreadcrumb, scrubEvent } from './monitoring-shared';

let started = false;

export function startMonitoring() {
  const dsn = monitoringDsn();
  if (started || !dsn || typeof window === 'undefined') return;
  started = true;

  const early = [];
  const keep = (e) => {
    if (early.length < 10) early.push(e?.reason || e?.error || e);
  };
  window.addEventListener('error', keep);
  window.addEventListener('unhandledrejection', keep);

  const load = async () => {
    try {
      const Sentry = await import('./sentry-client');
      Sentry.init({
        dsn,
        tunnel: '/api/monitoring',
        environment: monitoringEnvironment(),
        release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || window.__NEXT_DATA__?.buildId || undefined,
        sendDefaultPii: false,
        tracesSampleRate: 0,
        // Errors only: no session counting (an extra request on every visit, on slow connections), no tracing.
        defaultIntegrations: false,
        integrations: [
          Sentry.eventFiltersIntegration(),
          Sentry.functionToStringIntegration(),
          Sentry.browserApiErrorsIntegration(),
          Sentry.breadcrumbsIntegration({ console: false }),
          Sentry.globalHandlersIntegration(),
          Sentry.linkedErrorsIntegration(),
          Sentry.dedupeIntegration(),
          Sentry.httpContextIntegration(),
        ],
        beforeSend: scrubEvent,
        beforeBreadcrumb: scrubBreadcrumb,
        // Browser extensions and the site's own offline mode are not errors of the site.
        ignoreErrors: ['ResizeObserver loop', 'Failed to fetch', 'Load failed', 'NetworkError when attempting to fetch resource'],
        denyUrls: [/^chrome-extension:\/\//, /^moz-extension:\/\//, /^safari-web-extension:\/\//],
      });
      window.removeEventListener('error', keep);
      window.removeEventListener('unhandledrejection', keep);
      early.forEach((e) => Sentry.captureException(e));
    } catch {
      /* Monitoring must never break the page. */
    }
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(load, { timeout: 5000 });
  else window.setTimeout(load, 3000);
}
