/**
 * Readable text colours (WCAG 2.2: 4.5:1 for normal text). Several colours come from the CMS (alert legend, help
 * topics, report and initiative tags), so text on them is chosen when the page is drawn, not fixed in code.
 */

const INK = '#1A120E'; // the site's darkest brown, for text on light colours
const WHITE = '#FFFFFF';

function parse(hex) {
  const h = String(hex || '').trim().replace(/^#/, '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

const toHex = (rgb) => `#${rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`.toUpperCase();

/** Relative luminance (0 black – 1 white). */
export function luminance(hex) {
  const rgb = parse(hex);
  if (!rgb) return 1;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two colours (1–21). */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** `color` laid over `over` at `alpha` (0–1): the colour the eye sees, e.g. `${color}18` on white. */
export function blend(color, alpha, over = WHITE) {
  const c = parse(color);
  const o = parse(over);
  if (!c || !o) return over;
  return toHex(c.map((v, i) => v * alpha + o[i] * (1 - alpha)));
}

/** Text on a coloured background (a badge, a chip): white if it reads well enough, else the dark ink. */
export function textOn(bg, min = 4.5) {
  if (!parse(bg)) return WHITE;
  return contrast(WHITE, bg) >= min ? WHITE : INK;
}

/**
 * The colour itself as text on `bg`, darkened just enough to read (alert levels on their pale tint, a tag's colour
 * on white). Keeps the hue, so RED still looks red.
 */
export function ink(color, bg = WHITE, min = 4.5) {
  let rgb = parse(color);
  if (!rgb) return INK;
  for (let i = 0; i < 40 && contrast(toHex(rgb), bg) < min; i += 1) rgb = rgb.map((v) => v * 0.94);
  return toHex(rgb);
}

/**
 * Colours for a badge or chip filled with `bg`: white or dark text, whichever reads; when neither does (mid greens),
 * the fill is darkened slightly until white text reads. Returns MUI `sx` props.
 */
export function badge(bg, min = 4.5) {
  if (!parse(bg)) return { bgcolor: bg, color: WHITE };
  if (contrast(WHITE, bg) >= min) return { bgcolor: bg, color: WHITE };
  if (contrast(INK, bg) >= min) return { bgcolor: bg, color: INK };
  let rgb = parse(bg);
  for (let i = 0; i < 40 && contrast(WHITE, toHex(rgb)) < min; i += 1) rgb = rgb.map((v) => v * 0.95);
  return { bgcolor: toHex(rgb), color: WHITE };
}
