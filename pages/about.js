import { Box } from '@mui/material';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import StaleContentBanner from '../components/StaleContentBanner';
import AboutHubIntro from '../components/AboutHubIntro';
import CommissionedBySection from '../components/CommissionedBySection';
import GeographicCoverageSection from '../components/GeographicCoverageSection';
import KeyFeaturesCards from '../components/KeyFeaturesCards';
import HowItWorksStepper from '../components/HowItWorksStepper';
import Link from 'next/link';
import { Typography } from '@mui/material';
import { getAboutPage } from '../lib/wordpress';
import { getPageAllLocales, isPublishedPage } from '../lib/cms';
import { pageCopy } from '../lib/cms-community';
import { fallbackAboutPage } from '../lib/fallback-data';
import { featuresFromCms, stepsFromCms, partnersFromCms } from '../lib/cms-about-contact';
import { getCoverageAreas } from '../lib/cms-areas';
import { useLanguage } from '../contexts/LanguageContext';
import { APP_NAME } from '../lib/branding';
import {
  parseHowItWorksSteps,
  parseKeyFeatures,
  splitAboutContent,
} from '../lib/about-content';

const richTextSx = {
  maxWidth: 1200,
  mx: 'auto',
  px: { xs: 2, md: 4 },
  py: { xs: 4, md: 6 },
  fontSize: '1rem',
  lineHeight: 1.75,
  color: '#5A5A5A',
  '& h2': {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: { xs: '1.6rem', md: '2rem' },
    color: '#3D2B1F',
    mt: 5,
    mb: 2,
    '&:first-of-type': { mt: 0 },
  },
  '& h3': {
    fontFamily: '"Montserrat", sans-serif',
    fontSize: '1.2rem',
    color: '#3D2B1F',
    mt: 3,
    mb: 1,
  },
  '& p': { m: '0 0 1em' },
  '& ul, & ol': { pl: 3, mb: 2 },
  '& li': { mb: 0.75 },
  '& strong': { color: '#3D2B1F' },
  '& a': { color: '#C1440E' },
};

const headingSx = { fontFamily: '"Montserrat", sans-serif', fontSize: { xs: '1.6rem', md: '2rem' }, fontWeight: 700, color: '#3D2B1F', mb: 1 };

/** About from Karamoja → Website pages → About (once saved). */
function CmsAbout({ pageByLocale, areas }) {
  const { locale } = useLanguage();
  const { copy, shown, hero } = pageCopy(pageByLocale, locale, { hero: { image: fallbackAboutPage.featuredImage } });
  const intro = copy('intro');
  const features = shown('features') ? featuresFromCms(copy('features')) : [];
  const steps = shown('steps') ? stepsFromCms(copy('steps')) : [];
  const partnersCopy = copy('partners');
  const partners = shown('partners') ? partnersFromCms(partnersCopy) : [];

  return (
    <Layout title={hero.title || `About ${APP_NAME}`}>
      <PageHero title={hero.title} subtitle={hero.subtitle} image={hero.image} breadcrumbs={[hero.title || `About ${APP_NAME}`]} />

      {intro.title || intro.body ? (
        <Box sx={{ ...richTextSx, pb: 0 }}>
          {intro.title && <Typography component="h2" sx={headingSx}>{intro.title}</Typography>}
          {intro.body && <Box dangerouslySetInnerHTML={{ __html: intro.body }} />}
        </Box>
      ) : (
        <AboutHubIntro excludeCommissionedHighlight />
      )}

      <CommissionedBySection />

      <GeographicCoverageSection areas={areas} />

      {features.length > 0 && <KeyFeaturesCards features={features} title={copy('features').title || undefined} />}

      {steps.length > 0 && <HowItWorksStepper steps={steps} title={copy('steps').title || undefined} />}

      {partners.length > 0 && (
        <Box component="section" sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
          {partnersCopy.title && <Typography component="h2" sx={headingSx}>{partnersCopy.title}</Typography>}
          {partnersCopy.intro && <Typography sx={{ fontSize: '0.95rem', color: '#5A5A5A', lineHeight: 1.7, mb: 3, maxWidth: 760 }}>{partnersCopy.intro}</Typography>}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            {partners.map((o) => (
              <Box
                key={o.id}
                component={Link}
                href={o.href}
                sx={{ display: 'block', bgcolor: 'white', border: '1px solid #E8E0D5', borderRadius: 2, p: 2, textDecoration: 'none', '&:hover': { borderColor: '#C1440E' } }}
              >
                {o.abbr && <Typography sx={{ fontWeight: 800, color: '#C1440E', fontSize: '0.95rem' }}>{o.abbr}</Typography>}
                <Typography sx={{ fontWeight: 600, color: '#3D2B1F', fontSize: '0.85rem', lineHeight: 1.4 }}>{o.name}</Typography>
                {o.type && <Typography sx={{ color: '#9A9A9A', fontSize: '0.75rem', mt: 0.5 }}>{o.type}</Typography>}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Layout>
  );
}

export default function About({ source = 'legacy', pageByLocale, page, apiStale, areas = null }) {
  if (source === 'cms') return <CmsAbout pageByLocale={pageByLocale} areas={areas} />;
  return <LegacyAbout page={page} apiStale={apiStale} areas={areas} />;
}

function LegacyAbout({ page, apiStale, areas }) {
  const { outro, hasFeatures, hasStepper } = splitAboutContent(page.content);
  const features = parseKeyFeatures(page.content);
  const steps = parseHowItWorksSteps(page.content);

  return (
    <Layout title={`About ${APP_NAME}`}>
      <PageHero
        title={page.title}
        subtitle={page.subtitle}
        image={page.featuredImage}
        breadcrumbs={[`About ${APP_NAME}`]}
      />

      <StaleContentBanner show={apiStale} />

      <AboutHubIntro excludeCommissionedHighlight />

      <CommissionedBySection />

      <GeographicCoverageSection areas={areas} />

      {hasFeatures && <KeyFeaturesCards features={features} />}

      {hasStepper && <HowItWorksStepper steps={steps} />}

      {outro && (
        <Box sx={{ ...richTextSx, pt: hasStepper || hasFeatures ? 0 : undefined }} dangerouslySetInnerHTML={{ __html: outro }} />
      )}
    </Layout>
  );
}

export async function getStaticProps() {
  const areas = await getCoverageAreas();
  try {
    const pageByLocale = await getPageAllLocales('about');
    if (isPublishedPage(pageByLocale.en)) return { props: { source: 'cms', pageByLocale, areas }, revalidate: 3600 };
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.warn('[cms] about:', err.message);
  }
  // Until Website pages → About is saved (or Karamoja Core can't be reached): the old WordPress page.
  const { data, apiStale } = await getAboutPage();
  return {
    props: { page: data, apiStale, areas },
    revalidate: 3600,
  };
}
