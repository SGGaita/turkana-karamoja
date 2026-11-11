/**
 * Interface text: the website's fixed labels and messages, edited and translated in Karamoja → Interface text and
 * served in karamoja/v1/globals as `ui_strings`. `ui-strings.en.json` is the English fallback, used until the CMS answers
 * and for any key the CMS doesn't know yet. Add a key there **and** in Core's data/ui-strings.json.
 *
 * t('alerts.issued_on', { date }) fills `{date}`. With `{ n }`, keys that have `_one` / `_other` forms pick one.
 */
import EN from './ui-strings.en.json';

export const UI_STRINGS_EN = EN;

function pick(strings, key) {
  const fromCms = strings && typeof strings[key] === 'string' && strings[key] !== '' ? strings[key] : null;
  return fromCms ?? EN[key] ?? null;
}

/**
 * @param {Record<string,string>|null} strings ui_strings from globals (any language), or null
 * @param {string} key
 * @param {Record<string, string|number>} [vars]
 * @returns {string}
 */
export function translate(strings, key, vars) {
  let text = null;
  if (vars && typeof vars.n === 'number' && (EN[`${key}_one`] || EN[`${key}_other`])) {
    text = pick(strings, `${key}_${vars.n === 1 ? 'one' : 'other'}`);
  }
  if (text === null) text = pick(strings, key);
  if (text === null) return key; // Unknown key: visible in development, never blank.
  if (!vars) return text;
  return text.replace(/\{([a-z_]+)\}/g, (m, name) => (vars[name] === undefined || vars[name] === null ? m : String(vars[name])));
}
