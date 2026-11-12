import { useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import Layout from '../../components/Layout';
import PageHero from '../../components/PageHero';
import CmsUnavailable from '../../components/CmsUnavailable';
import { CommunityServiceMap, CommunityBackLink, StatusPill, StatChip, IntroBox, EmptyNote } from '../../components/CommunityServiceLayout';
import { toServiceMapMarker } from '../../lib/wp-mappers';
import { ASSISTANCE_SITE_TYPES } from '../../lib/community-services';
import { cmsStaticProps } from '../../lib/cms';
import { listCmsProps, pageCopy, assistanceSiteFromCms } from '../../lib/cms-community';
import { pickLocale } from '../../lib/cms-alerts';
import { useLanguage, useShell, useVocabLabel } from '../../contexts/LanguageContext';

// What the page showed before Karamoja → Website pages → Assistance sites is saved.
const DEFAULT_COPY = {
  hero: {
    title: 'Humanitarian Assistance Locator',
    subtitle: 'Food distribution, NFI, cash transfer and registration sites across Turkana and Karamoja',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1400&q=70',
  },
  intro: {},
  empty: { text: 'No assistance sites have been published yet.' },
};

// Built-in filter chips (labels from Interface text) until Site settings → Lists has the site types.
const FILTER_TYPES = [
  { key: 'all', labelKey: 'community.all_sites' },
  { key: 'food_distribution', labelKey: 'community.filter_food' },
  { key: 'nfi', labelKey: 'community.filter_nfi' },
  { key: 'cash_transfer', labelKey: 'community.filter_cash' },
  { key: 'registration', labelKey: 'community.filter_registration' },
];

export default function AssistancePage(props) {
  if (props.unavailable) return <CmsUnavailable />;
  return <AssistancePageBody {...props} />;
}

function AssistancePageBody({ itemsByLocale, pageByLocale }) {
  const { locale, t } = useLanguage();
  const assistanceSites = pickLocale(itemsByLocale, locale) || [];
  const { copy, hero } = pageCopy(pageByLocale, locale, DEFAULT_COPY);
  const typeLabel = useVocabLabel('site_types', ASSISTANCE_SITE_TYPES);
  // Filter chips: the site types from Site settings → Lists once saved, else the built-in short labels.
  const vocabTypes = useShell()?.vocabularies?.site_types;
  const filterTypes = (vocabTypes && Object.keys(vocabTypes).length
    ? [FILTER_TYPES[0], ...Object.entries(vocabTypes).map(([key, label]) => ({ key, label }))]
    : FILTER_TYPES
  ).map((f) => ({ key: f.key, label: f.label || t(f.labelKey) }));
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? assistanceSites : assistanceSites.filter((s) => s.siteType === filter);
  const markers = filtered.map((s) => toServiceMapMarker(s, 'assistance')).filter(Boolean);
  const agencies = [...new Set(assistanceSites.map((s) => s.agency).filter(Boolean))];

  return (
    <Layout title={hero.title}>
      <PageHero
        title={hero.title}
        subtitle={hero.subtitle}
        image={hero.image}
        breadcrumbs={['Community', 'Assistance Locator']}
      />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
        <CommunityBackLink />
        <IntroBox title={copy('intro').title} text={copy('intro').text} color="#E87010" />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <StatChip value={assistanceSites.length} label={t('community.active_sites')} color="#E87010" />
          <StatChip value={agencies.length} label={t('community.partner_agencies')} color="#3D2B1F" />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {filterTypes.map(({ key, label }) => (
            <Chip
              key={key}
              label={label}
              onClick={() => setFilter(key)}
              sx={{
                fontWeight: 600,
                fontSize: '0.72rem',
                bgcolor: filter === key ? '#E87010' : 'white',
                color: filter === key ? 'white' : '#3D2B1F',
                border: '1px solid #E8E0D5',
              }}
            />
          ))}
        </Box>

        <Box sx={{ mb: 5 }}>
          <CommunityServiceMap
            markers={markers}
            emptyMessage={t('community.no_sites_on_map')}
          />
        </Box>

        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '1.2rem', fontWeight: 700, mb: 2 }}>{t('community.sites_heading')}</Typography>
        {!assistanceSites.length && <EmptyNote text={copy('empty').text} />}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((site) => (
            <Box key={site.id} sx={{ bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2.5 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 0.75 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#3D2B1F', flex: 1 }}>{site.name}</Typography>
                {site.agency && <StatusPill label={site.agency} color="#E87010" />}
                {site.siteType && <StatusPill label={typeLabel(site.siteType)} color="#2E7BB4" />}
              </Box>
              <Typography sx={{ fontSize: '0.78rem', color: '#9A9A9A', mb: 0.5 }}>{site.region}{site.locationLabel ? ` · ${site.locationLabel}` : ''}</Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#5A5A5A', lineHeight: 1.6, mb: 1 }}>{site.desc}</Typography>
              {site.schedule && <Typography sx={{ fontSize: '0.75rem', color: '#3D2B1F' }}><strong>{t('community.schedule')}</strong> {site.schedule}</Typography>}
              {site.contact && <Typography sx={{ fontSize: '0.75rem', color: '#5A5A5A', mt: 0.5 }}><strong>{t('community.contact')}</strong> {site.contact}</Typography>}
              {site.lastUpdated && (
                <Typography sx={{ fontSize: '0.68rem', color: site.stale ? '#B85C00' : '#9A9A9A', mt: 1 }}>
                  {t('common.last_updated', { date: site.lastUpdated })}{site.stale ? ` · ${t('common.out_of_date')}` : ''}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Layout>
  );
}

export async function getStaticProps() {
  return cmsStaticProps(() => listCmsProps('assistance-sites', 'assistance', assistanceSiteFromCms), { revalidate: 60, name: 'assistance sites' });
}
