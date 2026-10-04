import {
  fallbackAlerts,
  fallbackReports,
  fallbackInitiatives,
  fallbackProgrammes,
  fallbackWaterPoints,
  fallbackAssistanceSites,
  fallbackPlantingAdvisories,
  fallbackPartners,
  fallbackNews,
  fallbackBulletins,
  fallbackSiteHeader,
  fallbackHero,
  fallbackAboutPage,
  fallbackContactPage,
  fallbackAlertLegend,
  fallbackCommunityPage,
  fallbackHomeSections,
} from './fallback-data';
import {
  mapAlert,
  shouldShowAlertOnMap,
  mapReport,
  mapInitiative,
  mapProgramme,
  mapWaterPoint,
  mapAssistanceSite,
  mapPlantingAdvisory,
  toServiceMapMarker,
  mapOrganization,
  mapOrganizationDetail,
  mapNewsPost,
  mapBulletin,
  mapCommunityInitiative,
  mapSiteHeader,
  mapHero,
  mapHomeSections,
  mapAlertLegend,
  mapCommunityPage,
  mapPage,
  mapContact,
  buildAdvisoryPayload,
  buildReportPayload,
  buildOrganizationPayload,
  getLanguageLabel,
} from './wp-mappers';
import { isHealthAlert } from './community-services';
import { APP_NAME, APP_FULL_NAME } from './branding';

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
  }, []);
}

export async function getMapAdvisories() {
  return fetchWithFallback(async () => {
    const posts = await fetchWp('/wp/v2/tk_alert?status=publish&per_page=100&_embed&orderby=date&order=desc');
    return (Array.isArray(posts) ? posts : [])
      .map(mapAlert)
      .filter(shouldShowAlertOnMap);
  }, []);
}

export async function getAlertById(id) {
  return fetchWithFallback(async () => {
    const post = await fetchWp(`/wp/v2/tk_alert/${id}?_embed`);
    return mapAlert(post);
  }, null);
}

export async function getReports() {
  return fetchWithFallback(async () => {
    const posts = await fetchWp('/wp/v2/tk_report?status=publish&per_page=100&_embed');
    return (Array.isArray(posts) ? posts : []).map(mapReport);
  }, fallbackReports);
}

export async function getReportById(id) {
  return fetchWithFallback(async () => {
    const post = await fetchWp(`/wp/v2/tk_report/${id}?_embed`);
    return mapReport(post);
  }, fallbackReports.find((r) => String(r.id) === String(id)) || null);
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
    const mapped = (Array.isArray(posts) ? posts : []).map(mapProgramme);
    return mapped.length ? mapped : fallbackProgrammes;
  }, fallbackProgrammes);
}

export async function getWaterPoints() {
  return fetchWithFallback(async () => {
    const posts = await fetchWp('/wp/v2/tk_water_point?status=publish&per_page=200&_embed');
    const mapped = (Array.isArray(posts) ? posts : []).map(mapWaterPoint);
    return mapped.length ? mapped : fallbackWaterPoints;
  }, fallbackWaterPoints);
}

export async function getAssistanceSites() {
  return fetchWithFallback(async () => {
    const posts = await fetchWp('/wp/v2/tk_assistance_site?status=publish&per_page=200&_embed');
    const mapped = (Array.isArray(posts) ? posts : []).map(mapAssistanceSite);
    return mapped.length ? mapped : fallbackAssistanceSites;
  }, fallbackAssistanceSites);
}

export async function getPlantingAdvisories() {
  return fetchWithFallback(async () => {
    const posts = await fetchWp('/wp/v2/tk_planting_advisory?status=publish&per_page=100&_embed');
    const mapped = (Array.isArray(posts) ? posts : []).map(mapPlantingAdvisory);
    return mapped.length ? mapped : fallbackPlantingAdvisories;
  }, fallbackPlantingAdvisories);
}

export async function getHealthAlerts() {
  return fetchWithFallback(async () => {
    const posts = await fetchWp('/wp/v2/tk_alert?status=publish&per_page=100&_embed&orderby=date&order=desc');
    const mapped = (Array.isArray(posts) ? posts : []).map(mapAlert).filter(isHealthAlert);
    return mapped;
  }, fallbackAlerts.filter(isHealthAlert));
}

export async function getOrganizations() {
  return fetchWithFallback(async () => {
    const posts = await fetchWp('/wp/v2/tk_organization?status=publish&per_page=100');
    return (Array.isArray(posts) ? posts : []).map(mapOrganization).filter((o) => o.verified);
  }, fallbackPartners.filter((p) => p.abbr !== '+ 30'));
}

function buildFallbackOrgProfile(id) {
  const org = fallbackPartners.find((p) => String(p.abbr) === String(id))
    || fallbackPartners.find((p) => String(p.name).includes('NDMA'))
    || fallbackPartners[2];
  const reports = fallbackReports.filter((r) => r.orgs?.some((o) => o.includes(org.abbr) || o.includes('NDMA')));
  const advisories = fallbackAlerts.filter((a) => a.source?.includes(org.abbr) || a.source?.includes('NDMA'));
  return {
    organization: {
      id: Number(id) || org.abbr,
      abbr: org.abbr,
      name: org.name,
      type: org.type,
      country: org.country,
      description: `${org.name} is a verified partner on ${APP_FULL_NAME}.`,
      verified: true,
    },
    reports,
    advisories,
    stats: { reports: reports.length, advisories: advisories.length },
  };
}

export async function getOrganizationProfile(id) {
  return fetchWithFallback(async () => {
    const raw = await fetchWp(`/tk/v1/organizations/${id}`);
    return {
      organization: mapOrganizationDetail(raw.organization),
      reports: (raw.reports || []).map(mapReport),
      advisories: (raw.advisories || []).map(mapAlert),
      stats: raw.stats || { reports: 0, advisories: 0 },
    };
  }, buildFallbackOrgProfile(id));
}

export async function getNewsPosts() {
  return fetchWithFallback(async () => {
    const posts = await fetchWp('/wp/v2/posts?status=publish&per_page=20&_embed');
    return (Array.isArray(posts) ? posts : []).map(mapNewsPost);
  }, fallbackNews);
}

export async function getBulletins() {
  return fetchWithFallback(async () => {
    const categoryId = await getCommunityInitiativesCategoryId();
    let path = '/wp/v2/posts?status=publish&per_page=20&_embed&orderby=date&order=desc';
    if (categoryId) {
      path += `&categories_exclude=${categoryId}`;
    }
    const posts = await fetchWp(path);
    const mapped = (Array.isArray(posts) ? posts : []).map(mapBulletin);
    return mapped.length ? mapped : fallbackBulletins;
  }, fallbackBulletins);
}

export const COMMUNITY_INITIATIVES_SLUG = 'community-initiatives';

async function getCommunityInitiativesCategoryId() {
  const categories = await fetchWp(`/wp/v2/categories?slug=${COMMUNITY_INITIATIVES_SLUG}`);
  const cat = Array.isArray(categories) ? categories[0] : null;
  return cat?.id || null;
}

export async function getCommunityInitiatives() {
  return fetchWithFallback(async () => {
    const categoryId = await getCommunityInitiativesCategoryId();
    if (!categoryId) {
      return [];
    }
    const posts = await fetchWp(
      `/wp/v2/posts?status=publish&per_page=100&categories=${categoryId}&orderby=date&order=desc&_embed`
    );
    return (Array.isArray(posts) ? posts : []).map(mapCommunityInitiative);
  }, []);
}

export async function getCommunityInitiativeById(id) {
  return fetchWithFallback(async () => {
    const categoryId = await getCommunityInitiativesCategoryId();
    const post = await fetchWp(`/wp/v2/posts/${id}?_embed`);
    if (!post?.id) {
      throw new Error('Community initiative not found');
    }
    if (categoryId && !(post.categories || []).includes(categoryId)) {
      throw new Error('Post is not a community initiative');
    }
    return mapCommunityInitiative(post);
  }, null);
}

export async function getSiteHeader(locale = 'en') {
  const fallback = fallbackSiteHeader;
  return fetchWithFallback(async () => {
    const raw = await fetchWp(`/tk/v1/site-header?lang=${encodeURIComponent(locale)}`);
    return mapSiteHeader(raw) || fallback;
  }, fallback);
}

export async function getHomeSections(locale = 'en') {
  return fetchWithFallback(async () => {
    const raw = await fetchWp(`/tk/v1/home-sections?lang=${encodeURIComponent(locale)}`);
    const mapped = mapHomeSections(raw);
    if (!mapped?.about?.titleLine1) {
      return { ...fallbackHomeSections, ...mapped };
    }
    return {
      ...fallbackHomeSections,
      ...mapped,
      about: { ...fallbackHomeSections.about, ...mapped.about },
      getInvolved: { ...fallbackHomeSections.getInvolved, ...mapped.getInvolved },
      map: { ...fallbackHomeSections.map, ...mapped.map },
      footer: { ...fallbackHomeSections.footer, ...mapped.footer },
    };
  }, fallbackHomeSections);
}

export async function getAboutPage() {
  return fetchWithFallback(async () => {
    const pages = await fetchWp('/wp/v2/pages?slug=about&status=publish&_embed');
    const page = Array.isArray(pages) ? pages[0] : null;
    if (!page) throw new Error('About page not found');
    const mapped = mapPage(page);
    if (!mapped?.title) throw new Error('About page invalid');
    return {
      ...fallbackAboutPage,
      ...mapped,
      featuredImage: mapped.featuredImage || fallbackAboutPage.featuredImage,
    };
  }, fallbackAboutPage);
}

export async function getHero(locale = 'en') {
  return fetchWithFallback(async () => {
    const raw = await fetchWp(`/tk/v1/hero?lang=${encodeURIComponent(locale)}`);
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
    };
  }, fallbackHero);
}

export async function getAlertLegend() {
  return fetchWithFallback(async () => {
    const raw = await fetchWp('/tk/v1/alert-legend');
    const mapped = mapAlertLegend(raw);
    if (!mapped?.items?.length) throw new Error('Alert legend invalid');
    return mapped;
  }, fallbackAlertLegend);
}

export async function getCommunityPage() {
  return fetchWithFallback(async () => {
    const raw = await fetchWp('/tk/v1/community-page');
    const mapped = mapCommunityPage(raw);
    if (!mapped) throw new Error('Community page settings invalid');
    return {
      outreach: {
        items: mapped.outreach.items.length
          ? mapped.outreach.items
          : fallbackCommunityPage.outreach.items,
      },
      radio: {
        title: mapped.radio.title || fallbackCommunityPage.radio.title,
        regions: mapped.radio.regions.length
          ? mapped.radio.regions
          : fallbackCommunityPage.radio.regions,
      },
    };
  }, fallbackCommunityPage);
}

export async function getContactPage() {
  return fetchWithFallback(async () => {
    const raw = await fetchWp('/tk/v1/contact');
    const mapped = mapContact(raw);
    if (!mapped?.title) throw new Error('Contact page invalid');
    return {
      ...fallbackContactPage,
      ...mapped,
      featuredImage: mapped.featuredImage || fallbackContactPage.featuredImage,
      offices: mapped.offices?.length ? mapped.offices : fallbackContactPage.offices,
      contacts: mapped.contacts?.length ? mapped.contacts : fallbackContactPage.contacts,
      social: mapped.social?.length ? mapped.social : fallbackContactPage.social,
    };
  }, fallbackContactPage);
}

export async function submitContactForm(form) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const res = await fetch(`${base}/wp-json/tk/v1/contact-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: form.name,
      email: form.email,
      phone: form.phone || '',
      organization: form.organization || '',
      subject: form.subject || `${APP_NAME} enquiry`,
      message: form.message,
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || json.code || 'Failed to send message');
  }
  return json;
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
  return { token: json.token, email: json.user_email, name: json.user_display_name };
}

export async function registerOrganization(form) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const payload = buildOrganizationPayload(form);
  const res = await fetch(`${base}/wp-json/tk/v1/register-organization`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || json.code || 'Registration failed');
  }
  return json;
}

export async function getOrganizationStatus(email) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const res = await fetch(
    `${base}/wp-json/tk/v1/organization-status?email=${encodeURIComponent(email)}`,
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Could not check organization status');
  }
  return json;
}

export async function uploadMedia(file, token) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${base}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'File upload failed');
  }
  return json;
}

export async function submitReport(form, token) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const docs = (form.documents || []).filter((d) => d.file);
  const files = [];

  for (const doc of docs) {
    const media = await uploadMedia(doc.file, token);
    files.push({
      url: media.source_url || '',
      size: formatFileSize(doc.file.size),
      language: doc.language || 'en',
      label: getLanguageLabel(doc.language || 'en'),
      filename: doc.file.name || '',
    });
  }

  const primary = files.find((f) => f.language === 'en') || files[0];
  const payload = buildReportPayload(form, {
    fileUrl: primary?.url || '',
    fileSize: primary?.size || '',
    files,
  });

  const res = await fetch(`${base}/wp-json/wp/v2/tk_report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Report submission failed');
  }
  return json;
}

export async function submitAdvisory(form, token) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const docs = (form.documents || []).filter((d) => d.file);
  const files = [];

  for (const doc of docs) {
    const media = await uploadMedia(doc.file, token);
    files.push({
      url: media.source_url || '',
      size: formatFileSize(doc.file.size),
      language: doc.language || 'en',
      label: getLanguageLabel(doc.language || 'en'),
      filename: doc.file.name || '',
    });
  }

  const payload = buildAdvisoryPayload(form, { files });
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

async function fetchWpAuth(path, token, options = {}) {
  const base = getWpBaseUrl();
  if (!base) throw new Error('WordPress URL not configured');

  const res = await fetch(`${base}/wp-json${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || json.code || `Request failed (${res.status})`);
  }
  return json;
}

export async function getMySubmissions(token) {
  return fetchWpAuth('/tk/v1/my-submissions', token);
}

export async function updateSubmission(type, id, payload, token) {
  return fetchWpAuth(`/tk/v1/my-submissions/${type}/${id}`, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function withdrawSubmission(type, id, token) {
  return fetchWpAuth(`/tk/v1/my-submissions/${type}/${id}/withdraw`, token, {
    method: 'POST',
  });
}

export async function addReportDocuments(reportId, documents, token) {
  return fetchWpAuth(`/tk/v1/my-submissions/report/${reportId}/documents`, token, {
    method: 'POST',
    body: JSON.stringify({ documents }),
  });
}

export async function removeReportDocument(reportId, url, token) {
  return fetchWpAuth(`/tk/v1/my-submissions/report/${reportId}/documents`, token, {
    method: 'DELETE',
    body: JSON.stringify({ url }),
  });
}

/** Count a public library download without blocking the file open. */
export function trackReportDownload(reportId, file = {}, onTracked) {
  const base = getWpBaseUrl();
  if (!base || !reportId) return;
  const payload = JSON.stringify({
    url: file.url || '',
    language: file.language || '',
    label: file.label || '',
    filename: file.filename || '',
  });
  fetch(`${base}/wp-json/tk/v1/reports/${encodeURIComponent(reportId)}/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
    mode: 'cors',
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((stats) => {
      if (stats && typeof onTracked === 'function') onTracked(stats);
    })
    .catch(() => {});
}

export { buildAdvisoryPayload };
