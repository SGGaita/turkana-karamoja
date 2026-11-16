/**
 * Next.js server hooks (FE-27). onRequestError: an error in a page or API route that nothing caught goes to error
 * monitoring (lib/monitoring-server.js) when NEXT_PUBLIC_SENTRY_DSN is set.
 */
export function register() {}

export async function onRequestError(err, request, context) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  const { reportServerError } = await import('./lib/monitoring-server');
  await reportServerError(err, {
    routePath: context?.routePath,
    routeType: context?.routeType,
    method: request?.method,
    path: request?.path,
  });
}
