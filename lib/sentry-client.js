/**
 * The parts of the Sentry browser SDK the site uses (errors only), imported by name so the rest (session replay,
 * feedback, tracing) is left out of the file. Loaded on demand by lib/monitoring.js.
 */
export {
  init, captureException, breadcrumbsIntegration, dedupeIntegration, functionToStringIntegration, globalHandlersIntegration,
  httpContextIntegration, eventFiltersIntegration, linkedErrorsIntegration, browserApiErrorsIntegration,
} from '@sentry/browser';
