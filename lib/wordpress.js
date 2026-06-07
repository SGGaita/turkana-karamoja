import {
  fallbackAlerts,
  fallbackReports,
  fallbackInitiatives,
  fallbackProgrammes,
  fallbackPartners,
  fallbackNews,
  fallbackBulletins,
} from './fallback-data';
import { fallbackSiteHeader, fallbackHero } from './fallback-data';
import {
  mapAlert,
  mapReport,
  mapInitiative,
  mapProgramme,
  mapOrganization,
  mapNewsPost,
  mapBulletin,
  mapSiteHeader,
  mapHero,
  buildAdvisoryPayload,
} from './wp-mappers';

export function getWpBaseUrl() {
  const url = process.env.NEXT_PUBLIC_WP_BASE_URL;
  if (!url || url.includes('your-wordpress-site')) return null;
  return url.replace(/\/$/, '');
}

async function fetchWp(path, options = {}) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const url = `${base}/wp-json${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`WP API ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

async function fetchWithFallback(fetcher, fallback) {
  try {
    if (!getWpBaseUrl()) {
      return { data: fallback, apiStale: true };
    }
    const data = await fetcher();
    return { data, apiStale: false };
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[wordpress]', err.message);
    }
    return { data: fallback, apiStale: true };
  }
}

export async function getAlerts() {
  return fetchWithFallback(async () => {
    const posts = await fetchWp('/wp/v2/tk_alert?status=publish&per_page=100&_embed&orderby=date&order=desc');
    const mapped = (Array.isArray(posts) ? posts : []).map(mapAlert);
    mapped.sort((a, b) => {
      const order = { RED: 0, ORANGE: 1, YELLOW: 2, GREEN: 3 };
      return (order[a.level] ?? 9) - (order[b.level] ?? 9);
    });
    return mapped;
  }, fallbackAlerts);
}

export async function getReports() {
  return fetchWithFallback(async () => {
    const posts = await fetchWp('/wp/v2/tk_report?status=publish&per_page=100&_embed');
    return (Array.isArray(posts) ? posts : []).map(mapReport);
  }, fallbackReports);
}

export async function getInitiatives() {
  return fetchWithFallback(async () => {
    const posts = await fetchWp('/wp/v2/tk_initiative?status=publish&per_page=100&_embed');
    return (Array.isArray(posts) ? posts : []).map(mapInitiative);
  }, fallbackInitiatives);
}

export async function getProgrammes() {
  return fetchWithFallback(async () => {
    const posts = await fetchWp('/wp/v2/tk_programme?status=publish&per_page=100&_embed');
    return (Array.isArray(posts) ? posts : []).map(mapProgramme);
  }, fallbackProgrammes);
}

export async function getOrganizations() {
  return fetchWithFallback(async () => {
    const posts = await fetchWp('/wp/v2/tk_organization?status=publish&per_page=100');
    return (Array.isArray(posts) ? posts : []).map(mapOrganization);
  }, fallbackPartners);
}

export async function getNewsPosts() {
  return fetchWithFallback(async () => {
    const posts = await fetchWp('/wp/v2/posts?status=publish&per_page=20&_embed');
    return (Array.isArray(posts) ? posts : []).map(mapNewsPost);
  }, fallbackNews);
}

export async function getBulletins() {
  return fetchWithFallback(async () => {
    const posts = await fetchWp('/wp/v2/posts?status=publish&per_page=20&_embed&categories_exclude=');
    const mapped = (Array.isArray(posts) ? posts : []).map(mapBulletin);
    return mapped.length ? mapped : fallbackBulletins;
  }, fallbackBulletins);
}

export async function getSiteHeader() {
  return fetchWithFallback(async () => {
    const raw = await fetchWp('/tk/v1/site-header');
    return mapSiteHeader(raw) || fallbackSiteHeader;
  }, fallbackSiteHeader);
}

export async function getHero() {
  return fetchWithFallback(async () => {
    const raw = await fetchWp('/tk/v1/hero');
    const mapped = mapHero(raw);
    if (!mapped?.title) return fallbackHero;
    return {
      ...fallbackHero,
      ...mapped,
      overview: {
        ...fallbackHero.overview,
        ...mapped.overview,
        metrics: mapped.overview.metrics?.length
          ? mapped.overview.metrics
          : fallbackHero.overview.metrics,
      },
      quickFacts: mapped.quickFacts?.length ? mapped.quickFacts : fallbackHero.quickFacts,
    };
  }, fallbackHero);
}

export async function getJwtToken(username, password) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const res = await fetch(`${base}/wp-json/jwt-auth/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Login failed');
  }
  return json.token;
}

export async function submitAdvisory(form, token) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const payload = buildAdvisoryPayload(form);
  const res = await fetch(`${base}/wp-json/wp/v2/tk_alert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Submission failed');
  }
  return json;
}

export { buildAdvisoryPayload };
