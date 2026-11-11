/**
 * About and Contact pages from Karamoja Core: Website pages → About / Contact, and the offices and social accounts
 * in Site settings. Pure functions: tested in tests/cms-about-contact.test.mjs.
 */
import { slugify } from './slug';

const str = (v) => (typeof v === 'string' ? v : '');
const rows = (v) => (Array.isArray(v) ? v : []);

/** "What the hub offers" cards in the KeyFeaturesCards shape. */
export function featuresFromCms(section) {
  return rows(section?.items)
    .map((r) => ({ title: str(r?.title), description: str(r?.text) }))
    .filter((f) => f.title);
}

/** "How it works" steps in the HowItWorksStepper shape (numbered in order). */
export function stepsFromCms(section) {
  return rows(section?.items)
    .map((r) => ({ title: str(r?.title), description: str(r?.text) }))
    .filter((s) => s.title)
    .map((s, i) => ({ ...s, step: i + 1 }));
}

/** Organisations chosen for the About page (verified only; the API sends nothing else). */
export function partnersFromCms(section) {
  return rows(section?.items)
    .filter((o) => o && o.id && str(o.title))
    .map((o) => ({
      id: o.id,
      name: str(o.title),
      abbr: str(o.abbreviation),
      type: str(o.type),
      href: `/organizations/${slugify(str(o.title)) || o.id}`,
    }));
}

/** Regional offices from Site settings → Offices. */
export function officesFromGlobals(g) {
  return rows(g?.sections?.contacts?.offices)
    .map((o) => ({
      name: str(o?.name),
      region: str(o?.region),
      address: str(o?.address),
      phone: str(o?.phone),
      email: str(o?.email),
      hours: str(o?.hours),
    }))
    .filter((o) => o.name);
}

/** Social accounts from Site settings → Social media (http(s) addresses only). */
export function socialFromGlobals(g) {
  const names = { x: 'X', facebook: 'Facebook', linkedin: 'LinkedIn', youtube: 'YouTube', whatsapp: 'WhatsApp' };
  return rows(g?.sections?.social?.links)
    .map((r) => {
      const url = str(r?.url?.href);
      return { network: str(r?.network), url: /^https?:\/\//i.test(url) ? url : '', label: names[str(r?.network)] || str(r?.network) };
    })
    .filter((s) => s.network && s.url);
}

/** "How we can help" box. */
export function helpBoxFromCms(section) {
  return {
    title: str(section?.title),
    items: rows(section?.items).map((r) => str(r?.text)).filter(Boolean),
    note: str(section?.note),
  };
}
