/**
 * Error monitoring on the server (FE-27): errors in pages and API routes that nothing caught, reported by
 * instrumentation.js (Next.js `onRequestError`). Sent straight to Sentry with @sentry/core (no Node SDK: errors only).
 */
import {
  createEventEnvelope, createStackParser, dsnFromString, exceptionFromError, getEnvelopeEndpointWithUrlEncodedAuth,
  serializeEnvelope, uuid4,
} from '@sentry/core';
import { monitoringDsn, monitoringEnvironment, scrubEvent, scrubUrl } from './monitoring-shared';

/** One line of a V8 stack: "    at fn (file:line:col)" or "    at file:line:col". */
const v8Line = [
  50,
  (line) => {
    const m = String(line).match(/^\s*at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?$/);
    if (!m) return undefined;
    const file = m[2];
    return {
      function: m[1] || '?',
      filename: file,
      lineno: Number(m[3]),
      colno: Number(m[4]),
      in_app: !/node_modules|^node:|^internal\//.test(file),
    };
  },
];
const parser = createStackParser(v8Line);

/** The Sentry event for an error (exported for tests). */
export function serverEvent(err, { routePath = '', routeType = '', method = '', path = '' } = {}, env = process.env) {
  const error = err instanceof Error ? err : new Error(String(err));
  return scrubEvent({
    event_id: uuid4(),
    timestamp: Date.now() / 1000,
    platform: 'node',
    level: 'error',
    environment: monitoringEnvironment(env),
    release: env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined,
    exception: { values: [exceptionFromError(parser, error)] },
    tags: { route: routePath || scrubUrl(path), route_type: routeType || 'unknown', runtime: env.NEXT_RUNTIME || 'nodejs' },
    request: { method, url: scrubUrl(path) },
  });
}

/** Sends one error to Sentry; never throws. */
export async function reportServerError(err, context = {}, env = process.env) {
  const dsnString = monitoringDsn(env);
  if (!dsnString) return false;
  try {
    const dsn = dsnFromString(dsnString);
    const body = serializeEnvelope(createEventEnvelope(serverEvent(err, context, env), dsn));
    const res = await fetch(getEnvelopeEndpointWithUrlEncodedAuth(dsn), {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
