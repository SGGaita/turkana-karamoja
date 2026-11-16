import { describe, expect, it } from 'vitest';
import { monitoringDsn, scrubEvent, scrubText, tunnelTarget } from '../lib/monitoring-shared';
import { serverEvent } from '../lib/monitoring-server';

const DSN = 'https://abc123@o42.ingest.sentry.io/4507';

describe('error monitoring (FE-27)', () => {
  it('is off without a DSN, and takes only a Sentry-style https DSN', () => {
    expect(monitoringDsn({})).toBe('');
    expect(monitoringDsn({ NEXT_PUBLIC_SENTRY_DSN: DSN })).toBe(DSN);
    expect(monitoringDsn({ NEXT_PUBLIC_SENTRY_DSN: 'http://abc@evil.example/1' })).toBe('');
    expect(monitoringDsn({ NEXT_PUBLIC_SENTRY_DSN: 'http://abc@localhost:9999/1' })).toBe('http://abc@localhost:9999/1');
  });

  it('removes personal data', () => {
    expect(scrubText('No account for jane@example.org, call +254 712 345 678')).toBe('No account for [email], call [phone]');
    const e = scrubEvent({
      user: { email: 'a@b.co' },
      message: 'x a@b.co',
      exception: { values: [{ type: 'Error', value: 'mail to a@b.co failed' }] },
      request: { url: 'https://hub.example.org/partners-stakeholders/reset-password?key=SECRET&login=a', method: 'GET', headers: { cookie: 'kc_session=1' } },
      breadcrumbs: [{ category: 'navigation', data: { from: '/a?key=1', to: '/b?token=2' } }],
    });
    expect(e.user).toBeUndefined();
    expect(e.exception.values[0].value).toBe('mail to [email] failed');
    expect(e.request).toEqual({ url: 'https://hub.example.org/partners-stakeholders/reset-password', method: 'GET' });
    expect(e.breadcrumbs[0].data).toEqual({ from: '/a', to: '/b' });
  });

  it('forwards browser reports only to the configured project', () => {
    const env = (dsn) => `${JSON.stringify({ dsn, event_id: 'x' })}\n{"type":"event"}\n{}`;
    expect(tunnelTarget(env(DSN), DSN)).toBe('https://o42.ingest.sentry.io/api/4507/envelope/');
    expect(tunnelTarget(env('https://abc123@o42.ingest.sentry.io/9999'), DSN)).toBe('');
    expect(tunnelTarget(env('https://other@evil.example/4507'), DSN)).toBe('');
    expect(tunnelTarget('not json', DSN)).toBe('');
  });

  it('builds a server event with the route and a parsed stack, without the query string', () => {
    const err = new Error('CMS said no to jane@example.org');
    const e = serverEvent(err, { routePath: '/api/push/broadcast', routeType: 'route', method: 'POST', path: '/api/push/broadcast?x=1' }, { NODE_ENV: 'production' });
    expect(e.exception.values[0]).toMatchObject({ type: 'Error', value: 'CMS said no to [email]' });
    expect(e.exception.values[0].stacktrace.frames.length).toBeGreaterThan(0);
    expect(e.tags).toMatchObject({ route: '/api/push/broadcast', route_type: 'route' });
    expect(e.request).toEqual({ method: 'POST', url: '/api/push/broadcast' });
    expect(e.environment).toBe('production');
  });
});
