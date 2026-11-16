import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanMeasurementId, noAnalyticsPage, readConsent, resetAnalyticsForTests, startAnalytics, stopAnalytics, track, writeConsent,
} from '../lib/analytics';
import { analyticsFromGlobals } from '../lib/cms-globals';

function fakeWindow({ gpc = false, stored = null } = {}) {
  const store = new Map(stored ? [['kc_consent', JSON.stringify(stored)]] : []);
  const target = new EventTarget();
  return Object.assign(target, {
    localStorage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) },
    navigator: { globalPrivacyControl: gpc },
    location: { hostname: 'hub.example.org' },
    store,
  });
}

describe('analytics settings (FE-27)', () => {
  it('accepts GA4 measurement IDs only', () => {
    expect(cleanMeasurementId(' g-abc123xyz9 ')).toBe('G-ABC123XYZ9');
    expect(cleanMeasurementId('UA-12345-1')).toBe('');
    expect(cleanMeasurementId('G-1"><script>')).toBe('');
  });
  it('reads Site settings → Analytics', () => {
    expect(analyticsFromGlobals({ sections: { analytics: { ga4_id: 'G-ABC123XYZ9', privacy_url: { label: 'Privacy', href: '/about' } } } }))
      .toEqual({ ga4Id: 'G-ABC123XYZ9', privacy: { label: 'Privacy', href: '/about' } });
    expect(analyticsFromGlobals({})).toEqual({ ga4Id: '', privacy: null });
  });
  it('never counts pages opened from password emails', () => {
    expect(noAnalyticsPage('/partners-stakeholders/reset-password')).toBe(true);
    expect(noAnalyticsPage('/partners-stakeholders/set-password?key=x')).toBe(true);
    expect(noAnalyticsPage('/partners-stakeholders')).toBe(false);
    expect(noAnalyticsPage('/reports')).toBe(false);
  });
});

describe('consent', () => {
  it('asks once, remembers the answer, and treats Global Privacy Control as "Decline"', () => {
    const w = fakeWindow();
    expect(readConsent(w)).toBe('');
    writeConsent('granted', w);
    expect(readConsent(w)).toBe('granted');
    expect(readConsent(fakeWindow({ gpc: true }))).toBe('denied');
    expect(readConsent(fakeWindow({ gpc: true, stored: { choice: 'granted' } }))).toBe('granted');
    expect(readConsent(null)).toBe('');
  });
});

describe('starting Google Analytics', () => {
  let scripts;
  beforeEach(() => {
    resetAnalyticsForTests();
    scripts = [];
    const w = fakeWindow();
    vi.stubGlobal('window', w);
    vi.stubGlobal('document', {
      createElement: () => ({}),
      head: { appendChild: (s) => scripts.push(s) },
      cookie: '_ga=GA1.1.1; _ga_ABC=x; other=1',
    });
    vi.stubGlobal('CustomEvent', class extends Event { constructor(n, o) { super(n); this.detail = o?.detail; } });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('loads gtag.js once, with consent denied by default and only analytics granted', () => {
    expect(startAnalytics('nope')).toBe(false);
    expect(scripts).toHaveLength(0);
    expect(startAnalytics('G-ABC123XYZ9', { language: 'sw' })).toBe(true);
    expect(startAnalytics('G-ABC123XYZ9')).toBe(true);
    expect(scripts).toHaveLength(1);
    expect(scripts[0].src).toBe('https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ9');
    const calls = window.dataLayer.map((a) => Array.from(a));
    expect(calls[0]).toEqual(['consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }]);
    expect(calls[1]).toEqual(['consent', 'update', { analytics_storage: 'granted' }]);
    expect(calls).toContainEqual(['set', 'user_properties', { site_language: 'sw' }]);
    expect(calls).toContainEqual(['config', 'G-ABC123XYZ9']);
  });

  it('sends events once started, and stops on "Decline"', () => {
    startAnalytics('G-ABC123XYZ9');
    track('file_download', { report_id: 5 });
    expect(Array.from(window.dataLayer.at(-1))).toEqual(['event', 'file_download', { report_id: 5 }]);
    stopAnalytics();
    expect(Array.from(window.dataLayer.at(-1))).toEqual(['consent', 'update', { analytics_storage: 'denied' }]);
  });
});
