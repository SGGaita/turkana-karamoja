import { afterEach, describe, expect, it, vi } from 'vitest';
import { countVisit, decide, dismiss, isIos, pageAllowed, promptSettings, track } from '../lib/install';

const NOW = 1_800_000_000_000;
const DAY = 24 * 3600 * 1000;
const base = { canInstall: true, installed: false, path: '/', now: NOW };

describe('settings', () => {
  it('uses the defaults: second visit, every page, until the visitor chooses, 7 days, 3 times', () => {
    expect(promptSettings(null)).toEqual({ show_after: 'second_visit', pages: 'all', seconds: 0, snooze_days: 7, max_dismissals: 3 });
  });
  it('keeps values in range', () => {
    expect(promptSettings({ show_after: 'x', pages: 'y', seconds: 9999, snooze_days: 0, max_dismissals: '4' }))
      .toEqual({ show_after: 'second_visit', pages: 'all', seconds: 300, snooze_days: 1, max_dismissals: 4 });
  });
});

describe('when the offer appears', () => {
  it('waits for the second visit by default', () => {
    expect(decide({ ...base, settings: null, state: { visits: 1 } })).toBe('no');
    expect(decide({ ...base, settings: null, state: { visits: 2 } })).toBe('show');
  });
  it('can appear straight away, after 30 seconds, or never', () => {
    expect(decide({ ...base, settings: { show_after: 'first_visit' }, state: { visits: 1 } })).toBe('show');
    expect(decide({ ...base, settings: { show_after: 'after_30s' }, state: { visits: 1 } })).toBe('after30s');
    expect(decide({ ...base, settings: { show_after: 'never' }, state: { visits: 9 } })).toBe('no');
  });
  it('stays away after "Later" for the snooze days, and for good after the last allowed "Later"', () => {
    const s = { show_after: 'first_visit', snooze_days: 7, max_dismissals: 3 };
    let state = dismiss({ visits: 3 }, s, NOW);
    expect(state.dismissals).toBe(1);
    expect(decide({ ...base, settings: s, state, now: NOW + 6 * DAY })).toBe('no');
    expect(decide({ ...base, settings: s, state, now: NOW + 7 * DAY + 1 })).toBe('show');
    state = dismiss(dismiss(state, s, NOW), s, NOW);
    expect(state.dismissals).toBe(3);
    expect(decide({ ...base, settings: s, state, now: NOW + 365 * DAY })).toBe('no');
  });
  it('never inside the installed app, when the browser can\'t install, or once installed', () => {
    const s = { show_after: 'first_visit' };
    expect(decide({ ...base, settings: s, state: {}, installed: true })).toBe('no');
    expect(decide({ ...base, settings: s, state: {}, canInstall: false })).toBe('no');
    expect(decide({ ...base, settings: s, state: { installedAt: NOW - DAY } })).toBe('no');
  });
  it('only on the chosen pages', () => {
    expect(pageAllowed('home', '/')).toBe(true);
    expect(pageAllowed('home', '/reports')).toBe(false);
    expect(pageAllowed('home_alerts', '/early-warnings/flood-12?x=1')).toBe(true);
    expect(pageAllowed('home_alerts', '/about')).toBe(false);
    expect(pageAllowed('all', '/about')).toBe(true);
    expect(pageAllowed('all', '/partners-stakeholders/dashboard')).toBe(false);
    expect(decide({ ...base, settings: { show_after: 'first_visit', pages: 'home' }, state: {}, path: '/reports' })).toBe('no');
  });
});

describe('visits and devices', () => {
  it('counts a new visit after 30 minutes away', () => {
    let s = countVisit({}, NOW);
    expect(s.visits).toBe(1);
    s = countVisit(s, NOW + 10 * 60 * 1000);
    expect(s.visits).toBe(1);
    s = countVisit(s, NOW + 10 * 60 * 1000 + 30 * 60 * 1000);
    expect(s.visits).toBe(2);
  });
  it('recognises iPhone, iPad and iPadOS', () => {
    expect(isIos('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Safari', 5)).toBe(true);
    expect(isIos('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari', 5)).toBe(true);
    expect(isIos('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari', 0)).toBe(false);
    expect(isIos('Mozilla/5.0 (Linux; Android 14) Chrome', 5)).toBe(false);
  });
});

describe('analytics', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it('reaches browser listeners always, and Google only after the visitor accepts (lib/analytics.js)', () => {
    const events = [];
    const target = new EventTarget();
    target.addEventListener('kc-analytics', (e) => events.push(e.detail));
    const gtag = vi.fn();
    vi.stubGlobal('window', Object.assign(target, { dataLayer: [], gtag }));
    vi.stubGlobal('CustomEvent', class extends Event { constructor(n, o) { super(n); this.detail = o?.detail; } });
    track('install_prompt_shown', { source: 'auto' });
    expect(gtag).not.toHaveBeenCalled();
    expect(window.dataLayer).toEqual([]);
    expect(events).toEqual([{ event: 'install_prompt_shown', source: 'auto' }]);
  });
});
