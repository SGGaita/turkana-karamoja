import Head from 'next/head';
import { APP_FULL_NAME, APP_META_DESCRIPTION } from '../lib/branding';
import Box from '@mui/material/Box';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import { toStripAlert } from '../lib/wp-mappers';
import ClimateHubSection from '../components/ClimateHubSection';
import MapSection from '../components/MapSection';
import WarningsStrip from '../components/WarningsStrip';
import InitiativesSection from '../components/InitiativesSection';
import GetInvolvedSection from '../components/GetInvolvedSection';
import Footer from '../components/Footer';
import {
  getAlerts,
  getMapAdvisories,
  getHero,
  getCommunityInitiatives,
} from '../lib/wordpress';
import { toMapAdvisoryMarker } from '../lib/wp-mappers';
import { useLocalizedHomeSections } from '../contexts/LanguageContext';

function HomeMapSection({ mapAdvisories, apiStale }) {
  const homeSections = useLocalizedHomeSections();
  const mapCopy = homeSections.map || {};
  return (
    <MapSection
      mapAdvisories={mapAdvisories}
      apiStale={apiStale}
      eyebrow={mapCopy.eyebrow}
      title={mapCopy.title}
      subtitle={mapCopy.subtitle}
    />
  );
}

export default function Home({
  alerts,
  mapAdvisories,
  initiatives,
  apiStale,
}) {
  const topAlert = (alerts || []).find((a) => a.level === 'RED' || a.level === 'ORANGE') || null;
  const urgentBanner = topAlert
    ? {
        level: topAlert.level,
        title: topAlert.title,
        desc: toStripAlert(topAlert).desc,
        href: toStripAlert(topAlert).href,
      }
    : null;

  return (
    <>
      <Head>
        <title>{`${APP_FULL_NAME} · Kenya · Uganda`}</title>
        <meta name="description" content={APP_META_DESCRIPTION} />
        <meta name="theme-color" content="#C1440E" />
      </Head>
      <Box sx={{ bgcolor: '#FDF6EC', minHeight: '100vh' }}>
        <Navbar urgentBanner={urgentBanner} />
        <Hero />
        <ClimateHubSection />
        <HomeMapSection mapAdvisories={mapAdvisories} apiStale={apiStale} />
        {alerts?.length > 0 && <WarningsStrip alerts={alerts} apiStale={apiStale} />}
        <InitiativesSection initiatives={initiatives} />
        <GetInvolvedSection />
        <Footer />
      </Box>
    </>
  );
}


export async function getStaticProps() {
  const [alertsRes, mapAdvisoriesRes, heroEnRes, heroSwRes, initiativesRes] = await Promise.all([
    getAlerts(),
    getMapAdvisories(),
    getHero('en'),
    getHero('sw'),
    getCommunityInitiatives(),
  ]);

  const apiStale =
    alertsRes.apiStale ||
    mapAdvisoriesRes.apiStale ||
    heroEnRes.apiStale ||
    heroSwRes.apiStale ||
    initiativesRes.apiStale;

  const mapAdvisories = (mapAdvisoriesRes.data || [])
    .map((alert, index) => toMapAdvisoryMarker(alert, index))
    .filter(Boolean);

  return {
    props: {
      alerts: alertsRes.data,
      mapAdvisories,
      initiatives: initiativesRes.data,
      apiStale,
      heroByLocale: {
        en: heroEnRes.data,
        sw: heroSwRes.data,
      },
    },
    revalidate: 120,
  };
}
