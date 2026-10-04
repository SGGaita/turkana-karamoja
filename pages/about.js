import { Box } from '@mui/material';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import StaleContentBanner from '../components/StaleContentBanner';
import AboutHubIntro from '../components/AboutHubIntro';
import CommissionedBySection from '../components/CommissionedBySection';
import GeographicCoverageSection from '../components/GeographicCoverageSection';
import KeyFeaturesCards from '../components/KeyFeaturesCards';
import HowItWorksStepper from '../components/HowItWorksStepper';
import { getAboutPage } from '../lib/wordpress';
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

export default function About({ page, apiStale }) {
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

      <GeographicCoverageSection />

      {hasFeatures && <KeyFeaturesCards features={features} />}

      {hasStepper && <HowItWorksStepper steps={steps} />}

      {outro && (
        <Box sx={{ ...richTextSx, pt: hasStepper || hasFeatures ? 0 : undefined }} dangerouslySetInnerHTML={{ __html: outro }} />
      )}
    </Layout>
  );
}

export async function getStaticProps() {
  const { data, apiStale } = await getAboutPage();
  return {
    props: { page: data, apiStale },
    revalidate: 3600,
  };
}
