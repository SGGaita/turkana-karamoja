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
import HomeOverview from '../components/HomeOverview';
import Footer from '../components/Footer';
import { toMapAdvisoryMarker } from '../lib/wp-mappers';
import CmsUnavailable from '../components/CmsUnavailable';
import { useLanguage, useLocalizedHomeSections } from '../contexts/LanguageContext';
import { cmsStaticProps, getCollection, getPageAllLocales, inAllLocales, isPublishedPage } from '../lib/cms';
import { homeProps } from '../lib/cms-home';
import { pickLocale, splitAlerts } from '../lib/cms-alerts';
import { initiativeFromCms } from '../lib/cms-community';
import { fallbackHero, fallbackHomeSections } from '../lib/fallback-data';

// The overview panel shows only from the CMS (no made-up figures, audit E7).
const ALL_VISIBLE = { hero: true, overview: false, about: true, map: true, warnings: true, initiatives: true, getInvolved: true };

function HomeMapSection({ mapAdvisories }) {
  const homeSections = useLocalizedHomeSections();
  const mapCopy = homeSections.map || {};
  return (
    <MapSection
      mapAdvisories={mapAdvisories}
      eyebrow={mapCopy.eyebrow}
      title={mapCopy.title}
      subtitle={mapCopy.subtitle}
    />
  );
}

export default function Home({ unavailable, alertsByLocale, initiatives, homeVisible = ALL_VISIBLE }) {
  const { locale } = useLanguage();
  if (unavailable) return <CmsUnavailable />;
  const show = { ...ALL_VISIBLE, ...(homeVisible || {}) };
  // Active alerts in the reader's language, most serious first; the map shows those marked for it.
  const alerts = splitAlerts(pickLocale(alertsByLocale, locale)).active;
  const mapAdvisories = alerts.filter((a) => a.onMap).map((a, i) => toMapAdvisoryMarker(a, i)).filter(Boolean);
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
        {show.overview && <HomeOverview />}
        {show.about && <ClimateHubSection />}
        {show.map && <HomeMapSection mapAdvisories={mapAdvisories} />}
        {show.warnings && alerts.length > 0 && <WarningsStrip alerts={alerts} />}
        {show.initiatives && <InitiativesSection initiatives={initiatives} />}
        {show.getInvolved && <GetInvolvedSection />}
        <Footer />
      </Box>
    </>
  );
}


/**
 * Alerts, the latest initiatives and Karamoja → Website pages → Home. Until Home is saved the built-in hero and
 * sections are shown (no placeholder figures: the overview panel shows only from the CMS, audit E7).
 */
async function cmsProps() {
  const [alertsByLocale, latest, pages] = await Promise.all([
    inAllLocales((l) => getCollection('alerts', { per_page: 50 }, l)),
    getCollection('initiatives', { per_page: 6 }, 'en'),
    getPageAllLocales('home').catch(() => null),
  ]);
  const initiatives = (Array.isArray(latest) ? latest : []).map(initiativeFromCms).filter(Boolean);
  const content = isPublishedPage(pages?.en)
    ? homeProps(pages, { en: fallbackHero }, { en: fallbackHomeSections }, initiatives)
    : { homeVisible: ALL_VISIBLE, initiatives };
  return { alertsByLocale, ...content }; // heroByLocale / homeSectionsByLocale go to the shell (_app.js).
}

export async function getStaticProps() {
  return cmsStaticProps(cmsProps, { revalidate: 120, name: 'home' });
}
