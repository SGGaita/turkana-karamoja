import { describe, expect, it } from 'vitest';
import { BUILT_IN_ICONS, DEFAULT_PWA, buildManifest, headIcons, iconSet, pushIcons, pwaLang } from '../lib/pwa';

const CMS = 'https://cms.example.org/wp-content/uploads/karamoja-pwa/abc1234567';
const live = {
  lang: 'sw',
  name: 'Kitovu cha Hali ya Hewa Karamoja',
  short_name: 'Karamoja',
  description: 'Maelezo',
  theme_color: '#3D2B1F',
  background_color: '#FFFFFF',
  icons_version: 'abc1234567',
  icons: {
    manifest: [
      { src: `${CMS}/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `${CMS}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: `${CMS}/maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    apple_touch_icon: `${CMS}/apple-touch-icon-180.png`,
    favicon: [`${CMS}/favicon-32.png`],
    badge: `${CMS}/badge-96.png`,
  },
  shortcuts: [
    { name: 'Tahadhari', short_name: 'Tahadhari', url: '/early-warnings' },
    { name: 'Outside', url: 'https://evil.example/' },
    { name: 'Reports', url: '/reports?type=a' },
  ],
};
const localFiles = {
  manifest: [
    { src: '/icons/cms/abc1234567/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icons/cms/abc1234567/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
  apple_touch_icon: '/icons/cms/abc1234567/apple-touch-icon-180.png',
  favicon: ['/icons/cms/abc1234567/favicon-32.png', '/icons/cms/abc1234567/icon-48.png'],
  badge: '/icons/cms/abc1234567/badge-96.png',
};
const snapshot = { pwa: { ...live, lang: 'en', short_name: 'Karamoja EN' }, local: { version: 'abc1234567', files: localFiles } };

describe('iconSet', () => {
  it('uses the downloaded copy when it is the CMS version', () => {
    expect(iconSet(live, snapshot)).toBe(localFiles);
  });
  it('uses the CMS addresses when the CMS has newer icons than the build', () => {
    expect(iconSet({ ...live, icons_version: 'fff0000000' }, snapshot)).toBe(live.icons);
  });
  it('uses the built-in icons when the CMS has no app icon', () => {
    expect(iconSet({ ...live, icons_version: '', icons: null }, snapshot)).toBe(BUILT_IN_ICONS);
  });
  it('uses the build copy, then the built-in icons, when the CMS is unreachable', () => {
    expect(iconSet(null, snapshot)).toBe(localFiles);
    expect(iconSet(null, { pwa: null, local: null })).toBe(BUILT_IN_ICONS);
    expect(iconSet(null, null)).toBe(BUILT_IN_ICONS);
  });
});

describe('buildManifest', () => {
  it('builds an installable manifest from the CMS answer', () => {
    const m = buildManifest(live, snapshot);
    expect(m).toMatchObject({
      id: '/',
      name: live.name,
      short_name: 'Karamoja',
      lang: 'sw',
      start_url: '/?source=pwa',
      scope: '/',
      display: 'standalone',
      theme_color: '#3D2B1F',
      background_color: '#FFFFFF',
    });
    expect(m.icons.map((i) => i.src)).toEqual(localFiles.manifest.map((i) => i.src));
    expect(m.icons.every((i) => i.type === 'image/png' && i.purpose)).toBe(true);
  });

  it('keeps only shortcuts to pages of the site, tagged as coming from the app', () => {
    const m = buildManifest(live, snapshot);
    expect(m.shortcuts.map((s) => s.url)).toEqual(['/early-warnings?source=pwa', '/reports?type=a&source=pwa']);
    expect(m.shortcuts[1].short_name).toBe('Reports');
    expect(m.shortcuts[0].icons[0].src).toBe('/icons/cms/abc1234567/icon-192.png');
  });

  it('falls back to the build copy, then to the old built-in manifest', () => {
    expect(buildManifest(null, snapshot).short_name).toBe('Karamoja EN');
    const d = buildManifest(null, null);
    expect(d.name).toBe(DEFAULT_PWA.name);
    expect(d.theme_color).toBe('#C1440E');
    expect(d.icons).toHaveLength(4);
    expect(d.shortcuts.map((s) => s.url)).toEqual(['/early-warnings?source=pwa', '/reports?source=pwa']);
  });

  it('refuses colours that are not #RRGGBB', () => {
    const m = buildManifest({ ...live, theme_color: 'red;}', background_color: '' }, null);
    expect(m.theme_color).toBe('#C1440E');
    expect(m.background_color).toBe('#FDF6EC');
  });

  it('has what browsers need to offer installing', () => {
    const m = buildManifest(live, snapshot);
    const any = m.icons.filter((i) => i.purpose === 'any').map((i) => i.sizes);
    expect(m.name && m.short_name && m.start_url && m.display).toBeTruthy();
    expect(['standalone', 'fullscreen', 'minimal-ui']).toContain(m.display);
    expect(any.length).toBeGreaterThan(0);
    expect(buildManifest(null, null).icons.map((i) => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
  });
});

describe('page head and push', () => {
  it('uses the downloaded icons and colour in every page head', () => {
    expect(headIcons(snapshot)).toEqual({
      themeColor: '#3D2B1F',
      appleTouchIcon: localFiles.apple_touch_icon,
      favicons: localFiles.favicon,
      shortName: 'Karamoja EN',
    });
    expect(headIcons(null).appleTouchIcon).toBe('/icons/apple-touch-icon.png');
  });
  it('sends notification icons on this site only', () => {
    expect(pushIcons(snapshot)).toEqual({ icon: '/icons/cms/abc1234567/icon-192.png', badge: localFiles.badge });
    expect(pushIcons(null)).toEqual({ icon: '/icons/icon-192.png', badge: '/icons/badge-96.png' });
    expect(pushIcons({ local: { files: { manifest: [], badge: 'https://evil.example/b.png' } } }).badge).toBe('/icons/badge-96.png');
  });
  it('accepts known languages only', () => {
    expect(pwaLang('SW')).toBe('sw');
    expect(pwaLang('../x')).toBe('en');
  });
});
