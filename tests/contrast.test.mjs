import { describe, it, expect } from 'vitest';
import { badge, blend, contrast, ink, textOn } from '../lib/contrast.js';

describe('readable colours (WCAG 4.5:1)', () => {
  it('measures contrast like WCAG', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    expect(contrast('#9A9A9A', '#FDF6EC')).toBeLessThan(4.5); // the old grey
    expect(contrast('#6B6B6B', '#FDF6EC')).toBeGreaterThanOrEqual(4.5); // its replacement
  });
  it('darkens a level colour just enough to read on its tint, keeping the hue', () => {
    for (const [c, bg] of [['#E87010', '#FFF4EC'], ['#B8860B', '#FFFBEC'], ['#D63030', '#FFF0F0'], ['#2E8B57', '#F0FFF6']]) {
      const out = ink(c, bg);
      expect(contrast(out, bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(out, bg)).toBeLessThan(6); // not much darker than needed
    }
    expect(ink('#1A120E', '#FFFFFF')).toBe('#1A120E'); // already fine: unchanged
  });
  it('picks text for a filled badge, darkening the fill only when neither white nor dark text reads', () => {
    for (const bg of ['#B8860B', '#E87010', '#2E8B57', '#9A9A9A', '#D63030', '#C1440E', '#F0D9B0', '#123456']) {
      const b = badge(bg);
      expect(contrast(b.color, b.bgcolor), bg).toBeGreaterThanOrEqual(4.5);
    }
    expect(badge('#C1440E')).toEqual({ bgcolor: '#C1440E', color: '#FFFFFF' });
    expect(badge('#B8860B').color).toBe('#1A120E');
    expect(textOn('#FFFFFF')).toBe('#1A120E');
    expect(badge('not a colour').color).toBe('#FFFFFF');
  });
  it('blends a tint over white', () => {
    expect(blend('#000000', 0.5)).toBe('#808080');
    expect(blend('#C1440E', 0)).toBe('#FFFFFF');
  });
});
