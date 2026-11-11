import { Box, Typography, Chip, Button } from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import StaleContentBanner from '../../components/StaleContentBanner';
import { partnerTypeColors } from '../../lib/fallback-data';
import { getOrganizations } from '../../lib/wordpress';
import { APP_NAME } from '../../lib/branding';
import { slugify } from '../../lib/slug';
import { getAll, getPageAllLocales, inAllLocales, isPublishedPage } from '../../lib/cms';
import { pickLocale } from '../../lib/cms-alerts';
import { pageCopy } from '../../lib/cms-community';
import { orgFromCms, groupsFromCms } from '../../lib/cms-orgs';
import { useLanguage } from '../../contexts/LanguageContext';

const countryLabels = { KE: 'Kenya', UG: 'Uganda', INT: 'International' };

// What the page shows before Karamoja → Website pages → Organisations is saved (same as Core's content pack).
const DEFAULT_COPY = {
  hero: {
    title: 'Partner Organizations',
    subtitle: `Verified institutions publishing advisories and reports on ${APP_NAME}`,
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&q=70',
  },
  intro: { text: 'These government agencies, UN bodies and humanitarian partners are registered on the hub. Select an organisation to see its profile, the advisories it published and the reports it shared.' },
  groups: {
    items: [
      { title: 'Meteorological services', text: 'KMD (Kenya Meteorological Department) and UMA (Uganda Meteorological Authority) publish forecasts, climate outlooks, weather advisories and seasonal updates.' },
      { title: 'Disaster management', text: 'NDMA Kenya, OPM Uganda and the county and district disaster units publish warnings, response updates and situation reports.' },
      { title: 'County and regional government', text: 'Turkana County Government and the Karamoja sub-regional coordination office share policy documents, plans and monitoring reports.' },
      { title: 'NGOs, UN agencies and partners', text: 'Registered humanitarian and development organisations share response updates, needs assessments and coordination documents.' },
    ],
  },
  list: { title: 'Verified partners' },
  empty: { text: 'No verified organisations have been published yet.' },
};
const GROUP_BG = [
  'linear-gradient(135deg, #E0EFF8 0%, #C8E0F0 100%)',
  'linear-gradient(135deg, #FFE8E8 0%, #FFCECE 100%)',
  'linear-gradient(135deg, #E8F5E0 0%, #CCEABD 100%)',
  'linear-gradient(135deg, #F5E8FF 0%, #E8CCFF 100%)',
];

/** Organisations from Karamoja Core: verified organisations, page text from Website pages → Organisations. */
function CmsOrganizations({ itemsByLocale, pageByLocale }) {
  const { locale, t } = useLanguage();
  const { copy, shown, hero } = pageCopy(pageByLocale, locale, DEFAULT_COPY);
  const sections = pickLocale(pageByLocale, locale)?.sections || null;
  // Sections that arrived with Core 0.28.0 read as the defaults on a page saved before.
  const section = (key) => (sections && sections[key] === undefined ? DEFAULT_COPY[key] : copy(key));
  const organizations = pickLocale(itemsByLocale, locale) || [];
  const groups = shown('groups') ? groupsFromCms(section('groups')) : [];
  const intro = section('intro');

  return (
    <Layout title={hero.title}>
      <PageHero title={hero.title} subtitle={hero.subtitle} image={hero.image} breadcrumbs={[hero.title]} />
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        {intro.title && <Typography component="h2" sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.3rem', fontWeight: 700, color: '#3D2B1F', mb: 1 }}>{intro.title}</Typography>}
        {intro.text && <Typography sx={{ fontSize: '0.9rem', color: '#5A5A5A', lineHeight: 1.7, mb: 4, maxWidth: 760 }}>{intro.text}</Typography>}

        {groups.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 6 }}>
            {groups.map((g, i) => (
              <Box key={g.title} sx={{ flex: '1 1 260px', bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ background: GROUP_BG[i % GROUP_BG.length], px: 2, py: 1.5 }}>
                  <Typography component="h3" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#3D2B1F' }}>{g.title}</Typography>
                </Box>
                {g.text && <Box sx={{ p: 2 }}><Typography sx={{ fontSize: '0.78rem', color: '#5A5A5A', lineHeight: 1.6 }}>{g.text}</Typography></Box>}
              </Box>
            ))}
          </Box>
        )}

        <Typography component="h2" sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.3rem', fontWeight: 700, color: '#3D2B1F', mb: 3 }}>
          {section('list').title || DEFAULT_COPY.list.title} ({organizations.length})
        </Typography>

        {organizations.length === 0 ? (
          <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#9A9A9A' }}>{section('empty').text}</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2.5 }}>
            {organizations.map((org) => {
              const color = partnerTypeColors[org.type] || '#2E7BB4';
              return (
                <Box
                  key={org.id}
                  component={Link}
                  href={`/organizations/${org.slug}`}
                  sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5, textDecoration: 'none', display: 'block', transition: 'all 0.2s', '&:hover': { borderColor: '#D4A96A', boxShadow: '0 4px 16px rgba(61,43,31,0.08)', transform: 'translateY(-2px)' } }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.72rem', color, flexShrink: 0, overflow: 'hidden' }}>
                      {org.abbr || org.name.slice(0, 2).toUpperCase()}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography component="h3" sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#3D2B1F', lineHeight: 1.3 }}>{org.name}</Typography>
                      {org.country && <Typography sx={{ fontSize: '0.72rem', color: '#9A9A9A', mt: 0.3 }}>{countryLabels[org.country] || org.country}</Typography>}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 1.5 }}>
                    {org.type && <Chip label={org.type} size="small" sx={{ bgcolor: '#FDF6EC', color: '#6B4226', fontSize: '0.62rem', height: 20 }} />}
                    <Chip label={t('orgs.verified')} size="small" sx={{ bgcolor: '#E0F5E9', color: '#2E8B57', fontSize: '0.62rem', height: 20 }} />
                  </Box>
                  {org.description && (
                    <Typography sx={{ fontSize: '0.78rem', color: '#5A5A5A', lineHeight: 1.55, mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {org.description}
                    </Typography>
                  )}
                  <Typography component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#C1440E', fontSize: '0.72rem', fontWeight: 600 }}>
                    {t('orgs.view_profile')} <ArrowForwardIcon sx={{ fontSize: 14 }} />
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Layout>
  );
}

export default function OrganizationsIndex({ source = 'legacy', itemsByLocale, pageByLocale, organizations, apiStale }) {
  if (source === 'cms') return <CmsOrganizations itemsByLocale={itemsByLocale} pageByLocale={pageByLocale} />;
  return <LegacyOrganizations organizations={organizations} apiStale={apiStale} />;
}

function LegacyOrganizations({ organizations, apiStale }) {
  return (
    <Layout title="Organizations">
      <PageHero
        title="Partner Organizations"
        subtitle={`Verified institutions publishing advisories and reports on ${APP_NAME}`}
        image="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&q=70"
        breadcrumbs={['Organizations']}
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <StaleContentBanner show={apiStale} />

        <Typography sx={{ fontSize: '0.85rem', color: '#5A5A5A', lineHeight: 1.7, mb: 4, maxWidth: 720 }}>
          These government agencies, UN bodies, and humanitarian partners are registered on the platform.
          Select an organisation to view its profile, published advisories, and submitted reports.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 6 }}>
          {DEFAULT_COPY.groups.items.map((p, i) => (
            <Box key={p.title} sx={{ flex: '1 1 260px', bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ background: GROUP_BG[i % GROUP_BG.length], px: 2, py: 1.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#3D2B1F' }}>{p.title}</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.78rem', color: '#5A5A5A', lineHeight: 1.6 }}>{p.text}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.3rem', fontWeight: 700, color: '#3D2B1F', mb: 3 }}>
          Verified Partners ({organizations.length})
        </Typography>

        {organizations.length === 0 ? (
          <Box sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#9A9A9A' }}>No verified organizations published yet.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2.5 }}>
            {organizations.map((org) => (
              <Box
                key={org.id || org.abbr}
                component={Link}
                href={`/organizations/${slugify(org.name) || org.id || org.abbr}`}
                sx={{
                  bgcolor: 'white',
                  border: '1px solid #E8E0D5',
                  borderRadius: 2,
                  p: 2.5,
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#D4A96A', boxShadow: '0 4px 16px rgba(61,43,31,0.08)', transform: 'translateY(-2px)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 1.5, bgcolor: `${partnerTypeColors[org.type] || '#2E7BB4'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.72rem', color: partnerTypeColors[org.type] || '#2E7BB4', flexShrink: 0 }}>
                    {org.abbr}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#3D2B1F', lineHeight: 1.3 }}>{org.name}</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#9A9A9A', mt: 0.3 }}>{countryLabels[org.country] || org.country}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 1.5 }}>
                  <Chip label={org.type} size="small" sx={{ bgcolor: '#FDF6EC', color: '#6B4226', fontSize: '0.62rem', height: 20 }} />
                  <Chip label="Verified" size="small" sx={{ bgcolor: '#E0F5E9', color: '#2E8B57', fontSize: '0.62rem', height: 20 }} />
                </Box>
                {org.description && (
                  <Typography sx={{ fontSize: '0.78rem', color: '#5A5A5A', lineHeight: 1.55, mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {org.description}
                  </Typography>
                )}
                <Button size="small" endIcon={<ArrowForwardIcon />} sx={{ color: '#C1440E', fontSize: '0.72rem', p: 0, '&:hover': { bgcolor: 'transparent' } }}>
                  View profile & activity
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Layout>
  );
}

export async function getStaticProps() {
  try {
    const [lists, pages] = await Promise.all([
      inAllLocales((l) => getAll('organizations', {}, l)),
      getPageAllLocales('organizations').catch(() => null),
    ]);
    const itemsByLocale = {};
    Object.entries(lists).forEach(([l, rows]) => {
      itemsByLocale[l] = (Array.isArray(rows) ? rows : []).map(orgFromCms).filter(Boolean);
    });
    // Addresses use the English name in every language.
    const enSlug = new Map((itemsByLocale.en || []).map((o) => [o.id, o.slug]));
    Object.values(itemsByLocale).forEach((list) => list.forEach((o) => { o.slug = enSlug.get(o.id) || o.slug; }));
    return { props: { source: 'cms', itemsByLocale, pageByLocale: isPublishedPage(pages?.en) ? pages : null }, revalidate: 300 };
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.warn('[cms] organizations:', err.message);
  }
  // Karamoja Core not reachable: the old endpoint, as before.
  const { data, apiStale } = await getOrganizations();
  return { props: { organizations: data, apiStale }, revalidate: 300 };
}
