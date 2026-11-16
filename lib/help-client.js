/**
 * Help in the partner portal (FE-14), read in the browser from Karamoja → Help (`karamoja/v1/help`). Answers are kept
 * for the session so opening a (?) twice costs nothing.
 */
const cache = new Map();

function base() {
  return String(process.env.NEXT_PUBLIC_WP_BASE_URL || '').replace(/\/$/, '');
}

async function getJson(path) {
  if (cache.has(path)) return cache.get(path);
  const p = fetch(`${base()}/wp-json/karamoja/v1${path}`, { signal: AbortSignal.timeout(8000) })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .catch((e) => {
      cache.delete(path);
      throw e;
    });
  cache.set(path, p);
  return p;
}

/** Short article entries: { key, title, excerpt }. */
function entries(list) {
  return (Array.isArray(list) ? list : [])
    .map((a) => ({ key: String(a?.key || a?.slug || ''), title: String(a?.title || ''), excerpt: String(a?.excerpt || '') }))
    .filter((a) => a.key && a.title);
}

/** Partner Guide articles, in the guide's order. */
export async function partnerArticles(lang = 'en') {
  const data = await getJson(`/help?audience=partner&lang=${encodeURIComponent(lang)}`);
  const topics = Array.isArray(data?.topics) ? data.topics : [];
  return entries(topics.flatMap((t) => (Array.isArray(t?.articles) ? t.articles : [])));
}

/** Articles that answer one place of the website (e.g. "partner.submit-advisory"). */
export async function contextArticles(key, lang = 'en') {
  const data = await getJson(`/help/context?keys=${encodeURIComponent(key)}&lang=${encodeURIComponent(lang)}`);
  return entries(Array.isArray(data) ? data : data?.articles || data?.items || []);
}
