import { APP_NAME, APP_TAGLINE, APP_FULL_NAME, APP_LOGO_URL } from './branding';
import { REGIONS_KENYA_DETAIL, REGIONS_UGANDA_DETAIL } from './regions';

/**
 * Built-in text and pictures, shown only until the matching CMS content is saved (Karamoja → Site settings and
 * Website pages). Everything here is true and safe to show; nothing invented (no sample offices, numbers or figures).
 * Content belongs in the CMS: tests/content-in-code.test.mjs keeps new content out of lib/ except this file.
 */

export const DEFAULT_SITE_HEADER = {
  branding: {
    title: APP_NAME,
    tagline: APP_TAGLINE,
    logoUrl: APP_LOGO_URL,
  },
  topbar: {
    links: [
      { label: 'Login / Register', href: '/partners-stakeholders' },
      { label: 'Help', href: '/help' },
    ],
  },
  navLinks: [
    { label: 'Home', href: '/' },
    { label: 'About Karamoja', href: '/about' },
    { label: 'Early Warnings', href: '/early-warnings' },
    { label: 'Community', href: '/community' },
    { label: 'Reports', href: '/reports' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Partners & Stakeholders', href: '/partners-stakeholders' },
  ],
  cta: { label: 'Alerts', href: '/early-warnings' },
};

export const DEFAULT_HOME_SECTIONS = {
  about: {
    eyebrow: `About ${APP_NAME}`,
    titleLine1: APP_NAME,
    titleLine2: APP_TAGLINE,
    description: `${APP_FULL_NAME} is a public-facing web platform that delivers early warnings, climate reports, community services, and partner information to pastoral and agropastoral communities across ${REGIONS_KENYA_DETAIL}, Kenya; and ${REGIONS_UGANDA_DETAIL}, Uganda. Spanning the border communities of Kenya and Uganda, the platform draws on national meteorological and government data sources to deliver clear, actionable climate intelligence to communities, county and national government directorates, and partner organizations — supporting better adaptation, resilience, and peaceful coexistence across the region.`,
    partnerCountLabel: 'Partner Organisations',
    ctaLabel: `More About ${APP_NAME}`,
    highlights: [
      { title: 'Commissioned by', desc: 'Danish Refugee Council — Karamoja Strong Project (KSP)' },
      { title: 'Early Warning Systems', desc: 'Climate and hazard alerts to support community preparedness and cascade early warning information across the region.' },
      { title: 'Adaptation Strategies & Best Practices', desc: 'Climate-smart agriculture, pastoralist mobility, and community-based natural resource management guides — supporting sustainable livelihoods and reducing resource-driven conflict.' },
    ],
  },
  getInvolved: {
    eyebrow: 'Get Involved',
    heading: 'Partner with Karamoja Strong Project',
    body: 'NGOs, UN agencies, government bodies and community organisations can register, submit climate advisories and reports, and contribute to cross-border resilience across the Karamoja Cluster.',
    buttonLabel: 'Get Involved',
  },
  map: {
    eyebrow: 'Geographic Coverage',
    title: 'Regional Coverage Map',
    subtitle: 'Interactive view of published advisories and key communities across Turkana County (Lokiriama and Loima Sub-Counties) and West Pokot County (Pokot North Sub-County), Kenya; and Moroto, Amudat, and Napak Districts, Uganda — pastoral communities linked across the Kenya–Uganda frontier. Click any marker for details.',
  },
  footer: {
    metaDescription: 'Climate change knowledge and information for pastoral communities in the Karamoja Cluster.',
    columnKaramoja: 'Karamoja',
    columnServices: 'Services',
    columnRegions: 'Regions',
    columnContact: 'Contact',
    contactLink: 'Contact Us →',
  },
};

/** Alert colour guide until Site settings → Alert legend is saved. */
export const ALERT_LEGEND = {
  title: 'Alert colour guide',
  items: [
    {
      level: 'RED',
      color: '#D63030',
      bg: '#FFF0F0',
      title: 'Severe / Extreme',
      description: 'Immediate danger. Follow evacuation and emergency guidance without delay.',
    },
    {
      level: 'ORANGE',
      color: '#E87010',
      bg: '#FFF4EC',
      title: 'High',
      description: 'Serious risk developing. Prepare now and follow recommended actions closely.',
    },
    {
      level: 'YELLOW',
      color: '#B8860B',
      bg: '#FFFBEC',
      title: 'Moderate / Watch',
      description: 'Conditions need attention. Stay informed and ready to act if the situation worsens.',
    },
    {
      level: 'GREEN',
      color: '#2E8B57',
      bg: '#F0FFF6',
      title: 'Normal / Information',
      description: 'No acute threat. Routine updates and situational information only.',
    },
  ],
};

export const DEFAULT_HERO = {
  eyebrow: 'Kenya · Uganda · Live updates',
  title: APP_NAME,
  titleAccent: APP_TAGLINE,
  subtitle:
    'Trusted weather warnings, food and water updates, and community guidance for pastoral families across Turkana, North Pokot, Moroto, Amudat and Napak — in one place, in clear language.',
  backgroundImage: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600&q=80',
  primaryCta: { label: "See today's warnings", href: '/early-warnings' },
  secondaryCta: { label: 'Learn about Karamoja', href: '#about' },
  overview: {
    title: "What's happening now",
    subtitle: 'A simple snapshot - no technical terms',
    footer:
      'Rainy season (Apr–Jun): Rains may be lighter than usual. Plan water, pasture, and food early.',
    // No made-up figures (audit v3 E7). Metrics come from the CMS only; empty means hidden.
    metrics: [],
  },
};

/** Colours for organisation types (design, not content). */
export const PARTNER_TYPE_COLORS = {
  'Met Agency': '#2E7BB4',
  Government: '#2E8B57',
  'UN Agency': '#3D2B1F',
  'Regional Body': '#6B4226',
  Research: '#B8860B',
  NGO: '#7B3FA8',
  Various: '#9A9A9A',
};

/** Header pictures until one is chosen in Website pages; the About hub picture until Home → About → Picture is set. */
export const PAGE_IMAGES = {
  about: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1400&q=70',
  contact: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1400&q=70',
  aboutHub: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80',
};

/** About → Commissioned by, until the About page is saved with Core 0.41.0 (same text as the CMS default). */
export const DEFAULT_COMMISSIONED = {
  title: 'Commissioned By',
  organization: 'Danish Refugee Council (DRC)',
  project: 'Karamoja Strong (KSP)',
  description:
    'Danish Refugee Council — Karamoja Strong Project (KSP). Supporting climate-resilient communities across the Karamoja Cluster through early warning systems, adaptation guidance, and cross-border coordination.',
};

/**
 * The community service pages, in the order the Community page lists them. Their title and subtitle are each page's
 * header (Karamoja → Website pages → that page); these are the built-in ones, shown until the page is saved.
 */
export const SERVICE_PAGES = [
  {
    key: 'assistance',
    href: '/community/assistance',
    title: 'Humanitarian Assistance Locator',
    subtitle: 'Food distribution, NFI, cash transfer and registration sites across Turkana and Karamoja',
  },
  {
    key: 'planting-calendar',
    href: '/community/planting-calendar',
    title: 'Farming & Planting Calendar',
    subtitle: 'Climate-smart agriculture advisories, seasonal planting windows, and agro-dealer locations',
  },
  {
    key: 'health',
    href: '/community/health',
    title: 'Health & Nutrition Alerts',
    subtitle: 'Acute malnutrition rates, disease outbreaks, health facility status, and vaccination campaigns',
  },
  {
    key: 'water-points',
    href: '/community/water-points',
    title: 'Water Point Status Map',
    subtitle: 'Status of boreholes, pans, dams and water trucking points across Turkana and Karamoja',
  },
];

/** Built-in header of a service page (title and subtitle). */
export function serviceHero(key) {
  const page = SERVICE_PAGES.find((p) => p.key === key) || {};
  return { title: page.title || '', subtitle: page.subtitle || '' };
}
