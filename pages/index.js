import Head from 'next/head';
import Box from '@mui/material/Box';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import { defaultUrgentBanner } from '../components/AlertBanner';
import { toStripAlert } from '../lib/wp-mappers';
import ForecastStrip from '../components/ForecastStrip';
import ClimateHubSection from '../components/ClimateHubSection';
import MapSection from '../components/MapSection';
import WarningsStrip from '../components/WarningsStrip';
import InitiativesSection from '../components/InitiativesSection';
import CommunitySection from '../components/CommunitySection';
import NewsSection from '../components/NewsSection';
import Footer from '../components/Footer';
import {
  getAlerts,
  getHero,
  getInitiatives,
  getProgrammes,
  getNewsPosts,
} from '../lib/wordpress';

export default function Home({
  alerts,
  hero,
  initiatives,
  programmes,
  news,
  apiStale,
}) {
  const urgentBanner = alerts.length
    ? {
        level: alerts[0].level,
        title: alerts[0].title,
        desc: toStripAlert(alerts[0]).desc,
      }
    : defaultUrgentBanner;

  return (
    <>
      <Head>
        <title>Turkana–Karamoja Climate Hub · Kenya · Uganda</title>
        <meta name="description" content="Cross-border climate intelligence platform serving 2.4 million people in Turkana and Karamoja" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <Box sx={{ bgcolor: '#FDF6EC', minHeight: '100vh' }}>
        <Navbar urgentBanner={urgentBanner} />
        <Hero hero={hero} />
        <ForecastStrip />
        <ClimateHubSection />
        <MapSection />
        <WarningsStrip alerts={alerts} apiStale={apiStale} />
        <InitiativesSection initiatives={initiatives} />
        <CommunitySection programmes={programmes} />
        <NewsSection news={news} />
        <Footer />
      </Box>
    </>
  );
}

export async function getStaticProps() {
  const [alertsRes, heroRes, initiativesRes, programmesRes, newsRes] = await Promise.all([
    getAlerts(),
    getHero(),
    getInitiatives(),
    getProgrammes(),
    getNewsPosts(),
  ]);

  const apiStale =
    alertsRes.apiStale ||
    heroRes.apiStale ||
    initiativesRes.apiStale ||
    programmesRes.apiStale ||
    newsRes.apiStale;

  return {
    props: {
      alerts: alertsRes.data,
      hero: heroRes.data,
      initiatives: initiativesRes.data,
      programmes: programmesRes.data,
      news: newsRes.data,
      apiStale,
    },
    revalidate: 120,
  };
}
