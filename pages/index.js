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
  getHomeSections,
} from '../lib/wordpress';
import { toMapAdvisoryMarker } from '../lib/wp-mappers';
import { useLocalizedHomeSections } from '../contexts/LanguageContext';
import { getPageAllLocales, isPublishedPage } from '../lib/cms';
import { homeProps } from '../lib/cms-home';
import { fallbackHomeSections } from '../lib/fallback-data';

const ALL_VISIBLE = { hero: true, about: true, map: true, warnings: true, initiatives: true, getInvolved: true };

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
  homeVisible = ALL_VISIBLE,
}) {
  const show = { ...ALL_VISIBLE, ...(homeVisible || {}) };
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
        {show.hero && <Hero />}
        {show.about && <ClimateHubSection />}
        {show.map && <HomeMapSection mapAdvisories={mapAdvisories} apiStale={apiStale} />}
        {show.warnings && alerts?.length > 0 && <WarningsStrip alerts={alerts} apiStale={apiStale} />}
        {show.initiatives && <InitiativesSection initiatives={initiatives} />}
        {show.getInvolved && <GetInvolvedSection />}
        <Footer />
      </Box>
    </>
  );
}


export async function getStaticProps() {
  const [alertsRes, mapAdvisoriesRes, heroEnRes, heroSwRes, initiativesRes, homeEnRes, homeSwRes] = await Promise.all([
    getAlerts(),
    getMapAdvisories(),
    getHero('en'),
    getHero('sw'),
    getCommunityInitiatives(),
    getHomeSections('en'),
    getHomeSections('sw'),
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

  const legacyHero = { en: heroEnRes.data, sw: heroSwRes.data };
  // Only pass legacy copy when it actually loaded, so a failed build-time fetch
  // doesn't pin fallback text over the client-side refresh.
  const legacyHome = {
    ...(homeEnRes.apiStale ? {} : { en: homeEnRes.data }),
    ...(homeSwRes.apiStale ? {} : { sw: homeSwRes.data }),
  };

  // Karamoja → Website pages → Home, once it has been saved in wp-admin. Until then (or if Karamoja Core is not
  // reachable) the legacy hero and home sections are used, as before.
  let content = { heroByLocale: legacyHero, homeSectionsByLocale: legacyHome, homeVisible: ALL_VISIBLE, homeSource: 'legacy' };
  try {
    const pages = await getPageAllLocales('home');
    if (isPublishedPage(pages.en)) {
      content = { ...homeProps(pages, legacyHero, { en: fallbackHomeSections, ...legacyHome }), homeSource: 'cms' };
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.warn('[cms] home:', err.message);
  }

  return {
    props: {
      alerts: alertsRes.data,
      mapAdvisories,
      initiatives: initiativesRes.data,
      apiStale,
      ...content,
    },
    revalidate: 120,
  };
}
