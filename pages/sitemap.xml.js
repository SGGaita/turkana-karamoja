import { getAll, getGlobals } from '../lib/cms';
import { languagesFromGlobals } from '../lib/cms-globals';
import { getHelpTopics, topicsFromCms } from '../lib/cms-help';
import { siteUrl, sitemapEntries, sitemapXml } from '../lib/seo';

/** /sitemap.xml: the main pages plus every alert, report, organisation, initiative and help article (FE-23). */
export default function Sitemap() {
  return null;
}

const settled = (r) => (r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : []);

export async function getServerSideProps({ res }) {
  if (!siteUrl()) {
    res.statusCode = 404; // No public address configured: a sitemap of relative links would be wrong.
    res.end('Sitemap not available: NEXT_PUBLIC_SITE_URL is not set.');
    return { props: {} };
  }
  const [alerts, reports, organizations, initiatives, topics, globals] = await Promise.allSettled([
    getAll('alerts'),
    getAll('reports'),
    getAll('organizations'),
    getAll('initiatives'),
    getHelpTopics('en'),
    getGlobals('en'),
  ]);
  // Every page in each language marked ready in Site settings → Languages (FE-26); English only if unknown.
  const ready = globals.status === 'fulfilled' ? languagesFromGlobals(globals.value) : [];
  let helpSlugs = [];
  if (topics.status === 'fulfilled') {
    try {
      helpSlugs = Object.values(topicsFromCms(topics.value).guides).flatMap((g) => g.articles.map((a) => a.slug));
    } catch {
      helpSlugs = [];
    }
  }
  const body = sitemapXml(sitemapEntries({
    alerts: settled(alerts),
    reports: settled(reports),
    organizations: settled(organizations),
    initiatives: settled(initiatives),
    helpSlugs,
  }), process.env, ready.length ? ready : undefined);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.end(body);
  return { props: {} };
}
