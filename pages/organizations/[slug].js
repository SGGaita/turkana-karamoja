import { Box, Typography, Chip, Button, Divider } from '@mui/material';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import CmsUnavailable from '../../components/CmsUnavailable';
import { partnerTypeColors } from '../../lib/fallback-data';
import { buildSlugPath, slugify } from '../../lib/slug';
import { cmsStaticProps, cmsGet, cmsLocale, getAll, getPageAllLocales, inAllLocales, isPublishedPage } from '../../lib/cms';
import { pickLocale, levelLabel } from '../../lib/cms-alerts';
import { pageCopy } from '../../lib/cms-community';
import { profileFromCms } from '../../lib/cms-orgs';
import { useLanguage } from '../../contexts/LanguageContext';

const countryLabels = { KE: 'Kenya', UG: 'Uganda', INT: 'International' };

const ORG_HERO_IMAGE = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&q=70';
const headingSx = { fontFamily: '"Montserrat", sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#3D2B1F', mb: 2 };
const emptySx = { bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 3, mb: 5 };

/** An organisation page from Karamoja Core: profile, its advisories and reports (English addresses in every language). */
function CmsProfile({ profileByLocale, pageByLocale, paths }) {
  const { locale, t } = useLanguage();
  const profile = pickLocale(profileByLocale, locale);
  const { copy } = pageCopy(pageByLocale, locale, { hero: { image: ORG_HERO_IMAGE } });
  const heroCopy = copy('hero');
  const { organization: org, advisories, reports, counts } = profile;
  const color = partnerTypeColors[org.type] || '#2E7BB4';
  const subtitle = [org.type, countryLabels[org.country] || org.country].filter(Boolean).join(' · ') || heroCopy.fallback_subtitle || '';
  const latest = (shown, n) => (n > shown ? <Typography sx={{ fontSize: '0.75rem', color: '#9A9A9A', mt: -1, mb: 2 }}>{t('orgs.latest', { shown, n })}</Typography> : null);

  return (
    <Layout title={org.name}>
      <PageHero title={org.name} subtitle={subtitle} image={heroCopy.image?.url || ORG_HERO_IMAGE} breadcrumbs={['Organizations', org.abbr || org.name]} />
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <Button component={Link} href="/organizations" startIcon={<ArrowBackIcon />} sx={{ color: '#2E7BB4', mb: 3, textTransform: 'none' }}>
          {t('orgs.all')}
        </Button>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 5 }}>
          <Box sx={{ flex: '2 1 480px' }}>
            <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color, flexShrink: 0 }}>
                  {org.abbr || org.name.slice(0, 2).toUpperCase()}
                </Box>
                <Box>
                  <Typography component="h2" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#3D2B1F' }}>{org.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                    {org.type && <Chip label={org.type} size="small" sx={{ fontSize: '0.65rem', height: 22 }} />}
                    {org.verified && <Chip label={t('orgs.verified_partner')} size="small" sx={{ bgcolor: '#E0F5E9', color: '#2E8B57', fontSize: '0.65rem', height: 22 }} />}
                  </Box>
                </Box>
              </Box>
              {org.descriptionHtml && (
                <Box sx={{ fontSize: '0.88rem', color: '#5A5A5A', lineHeight: 1.75, mb: 2, '& p': { m: '0 0 0.8em' }, '& a': { color: '#C1440E' } }} dangerouslySetInnerHTML={{ __html: org.descriptionHtml }} />
              )}
              {org.website && (
                <Typography sx={{ fontSize: '0.85rem', mb: 2 }}>
                  {t('orgs.website')}: <a href={org.website} target="_blank" rel="noopener noreferrer" style={{ color: '#2E7BB4' }}>{org.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>
                </Typography>
              )}
              {(org.contactName || org.contactEmail || org.contactPhone) && (
                <Box sx={{ pt: 2, borderTop: '1px solid #E8E0D5' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', mb: 1 }}>{t('orgs.contact')}</Typography>
                  {org.contactName && <Typography sx={{ fontSize: '0.85rem', color: '#3D2B1F' }}>{org.contactName}</Typography>}
                  {org.contactEmail && <Typography component="a" href={`mailto:${org.contactEmail}`} sx={{ display: 'block', fontSize: '0.85rem', color: '#2E7BB4', textDecoration: 'none' }}>{org.contactEmail}</Typography>}
                  {org.contactPhone && <Typography component="a" href={`tel:${org.contactPhone.replace(/[^\d+]/g, '')}`} sx={{ display: 'block', fontSize: '0.85rem', color: '#2E7BB4', textDecoration: 'none' }}>{org.contactPhone}</Typography>}
                </Box>
              )}
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ bgcolor: '#3D2B1F', borderRadius: 2, p: 2.5, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#D4A96A' }}>{counts.advisories}</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#E8E0D5' }}>{t('orgs.advisories_published')}</Typography>
            </Box>
            <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#C1440E' }}>{counts.reports}</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#5A5A5A' }}>{t('orgs.reports_shared')}</Typography>
            </Box>
          </Box>
        </Box>

        <Typography component="h2" sx={headingSx}>{t('orgs.advisories_heading', { n: counts.advisories })}</Typography>
        {latest(advisories.length, counts.advisories)}
        {advisories.length === 0 ? (
          <Box sx={emptySx}><Typography sx={{ fontSize: '0.85rem', color: '#9A9A9A' }}>{t('orgs.no_advisories')}</Typography></Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 5 }}>
            {advisories.map((a) => (
              <Box key={a.id} component={Link} href={paths.alerts[a.id] || '/early-warnings'} sx={{ display: 'block', textDecoration: 'none', bgcolor: a.bg, border: `1px solid ${a.color}40`, borderLeft: `5px solid ${a.color}`, borderRadius: 2, p: 2.5, opacity: a.active ? 1 : 0.75 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                  <Chip label={levelLabel(a.level, t)} size="small" sx={{ bgcolor: a.color, color: 'white', fontWeight: 700, fontSize: '0.62rem' }} />
                  {!a.active && <Chip label={a.cancelled ? t('alerts.cancelled') : (a.replaced ? t('alerts.replaced') : t('alerts.ended'))} size="small" sx={{ bgcolor: '#5A5A5A', color: 'white', fontWeight: 700, fontSize: '0.62rem' }} />}
                  <Typography component="h3" sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#3D2B1F' }}>{a.title}</Typography>
                </Box>
                {a.body && <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', lineHeight: 1.65, mb: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.body}</Typography>}
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {a.area && <Typography sx={{ fontSize: '0.72rem', color: '#9A9A9A' }}>{t('alerts.area_affected')}: <strong style={{ color: '#3D2B1F' }}>{a.area}</strong></Typography>}
                  {a.issued && <Typography sx={{ fontSize: '0.72rem', color: '#9A9A9A' }}>{t('alerts.issued_on', { date: a.issued })}</Typography>}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ mb: 4 }} />

        <Typography component="h2" sx={headingSx}>{t('orgs.reports_heading', { n: counts.reports })}</Typography>
        {latest(reports.length, counts.reports)}
        {reports.length === 0 ? (
          <Box sx={emptySx}><Typography sx={{ fontSize: '0.85rem', color: '#9A9A9A' }}>{t('orgs.no_reports')}</Typography></Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {reports.map((r) => (
              <Box key={r.id} sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 0.8 }}>
                  <Chip label={r.tag} size="small" sx={{ bgcolor: r.tagColor, color: 'white', fontWeight: 600, fontSize: '0.62rem', height: 20 }} />
                </Box>
                <Typography component={Link} href={paths.reports[r.id] || '/reports'} sx={{ display: 'block', fontWeight: 700, fontSize: '0.92rem', color: '#3D2B1F', mb: 0.6, textDecoration: 'none', '&:hover': { color: '#C1440E', textDecoration: 'underline' } }}>
                  {r.title}
                </Typography>
                {r.desc && <Typography sx={{ fontSize: '0.8rem', color: '#5A5A5A', lineHeight: 1.6, mb: 1 }}>{r.desc}</Typography>}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Typography sx={{ fontSize: '0.68rem', color: '#9A9A9A' }}>{r.date}{r.size ? ` · ${r.size}` : ''}</Typography>
                  <Button size="small" variant="contained" component={Link} href={paths.reports[r.id] || '/reports'} sx={{ bgcolor: '#3D2B1F', '&:hover': { bgcolor: '#C1440E' }, fontSize: '0.72rem' }}>
                    {t('orgs.view_report')}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Layout>
  );
}

export default function OrganizationProfile(props) {
  if (props.unavailable) return <CmsUnavailable />;
  return <CmsProfile {...props} />;
}

export async function getStaticPaths() {
  try {
    const orgs = await getAll('organizations', {}, 'en');
    return { paths: orgs.filter((o) => o && o.title).map((o) => ({ params: { slug: slugify(o.title) || String(o.id) } })), fallback: 'blocking' };
  } catch {
    return { paths: [], fallback: 'blocking' }; // Core not reachable: each page is made on its first visit.
  }
}

/** Karamoja Core: the organisation in every language, the page text, and English addresses for its items. */
async function cmsProps(slug) {
  const [byLocale, pages] = await Promise.all([
    inAllLocales((l) => cmsGet(`/organizations/${encodeURIComponent(slug)}`, { lang: cmsLocale(l) })),
    getPageAllLocales('organization-detail').catch(() => null),
  ]);
  const profileByLocale = {};
  Object.entries(byLocale).forEach(([l, dto]) => {
    const p = profileFromCms(dto);
    if (p) profileByLocale[l] = p;
  });
  if (!profileByLocale.en) return null;
  const en = byLocale.en.activity || {};
  const paths = { alerts: {}, reports: {} };
  (en.alerts || []).forEach((a) => { paths.alerts[a.id] = `/early-warnings/${buildSlugPath(a.title, a.id)}`; });
  (en.reports || []).forEach((r) => { paths.reports[r.id] = `/reports/${buildSlugPath(r.title, r.id)}`; });
  return { profileByLocale, pageByLocale: isPublishedPage(pages?.en) ? pages : null, paths };
}

// Organisation addresses are name slugs (no id), e.g. "/organizations/ndma". Core finds the organisation by it.
export async function getStaticProps({ params }) {
  return cmsStaticProps(async () => {
    const props = await cmsProps(params.slug);
    if (!props) return null;
    const canonical = props.profileByLocale.en.organization.slug;
    if (canonical !== params.slug) return { redirect: { destination: `/organizations/${canonical}`, permanent: false } };
    return props;
  }, { revalidate: 300, name: 'organization' });
}
