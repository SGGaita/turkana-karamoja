import {
  APP_NAME,
  APP_TAGLINE,
  APP_FULL_NAME,
  APP_STATUS_TEXT,
  APP_LOGO_URL,
} from './branding';
import { GEO_COVERAGE_HTML, platformCoverageIntro } from './regions';

/**
 * Static fallback content when WordPress is unset or unreachable.
 * Single source of truth - UI imports from here or via lib/wordpress.js.
 */

export const fallbackSiteHeader = {
  branding: {
    title: APP_NAME,
    tagline: APP_TAGLINE,
    logoUrl: APP_LOGO_URL,
  },
  topbar: {
    statusText: APP_STATUS_TEXT,
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

export const fallbackHomeSections = {
  about: {
    eyebrow: `About ${APP_NAME}`,
    titleLine1: APP_NAME,
    titleLine2: APP_TAGLINE,
    description: `${platformCoverageIntro(APP_FULL_NAME)} Spanning the border communities of Kenya and Uganda, the platform draws on national meteorological and government data sources to deliver clear, actionable climate intelligence to communities, county and national government directorates, and partner organizations — supporting better adaptation, resilience, and peaceful coexistence across the region.`,
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
    linksKaramoja: ['About Karamoja', 'Our Partners', 'Data Sources', 'Methodology'],
    linksServices: ['Early Warnings', 'Weather Forecasts', 'Community Bulletins', 'Submit Advisory', 'Donor Portal'],
  },
};

export const fallbackAlertLegend = {
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

export const fallbackAboutPage = {
  title: `About ${APP_NAME}`,
  subtitle: APP_TAGLINE,
  featuredImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1400&q=70',
  content: `
    <h2>Our Mission</h2>
    <p>${APP_FULL_NAME} is a joint Kenya-Uganda online climate change information and knowledge platform serving pastoral and agropastoral communities in the border areas of Kenya and Uganda. Developed through the Karamoja Strong (KSP) project, this platform utilizes digital technologies to improve climate adaptation awareness and sharing of early warning systems information for promoting climate-resilient communities.</p>
    <p>Northern Kenya and the Karamoja region are arid areas inhabited by nomadic pastoralists, characterized by fragile ecosystems ravaged by climate change effects. The region is drought-prone, with depleted livestock, water, and pasture resources.</p>
    <p>Our mission is to strengthen climate resilience by ensuring timely, accurate, and accessible climate information reaches pastoral communities — empowering them to make informed decisions about their livelihoods, safety, and well-being.</p>
    <h2>Commissioned By</h2>
    <p>This platform was commissioned by the <strong>Danish Refugee Council (DRC)</strong> through the <strong>Karamoja Strong (KSP) project</strong>, responding to climate change-affected communities by promoting sustainable livelihoods, natural resource management, and better climate adaptation in the border areas of Kenya and Uganda.</p>
    <h2>Geographic Coverage</h2>
    ${GEO_COVERAGE_HTML}
    <h2>Key Features &amp; Services</h2>
    <ul>
      <li><strong>Early Warning Systems</strong> — Flood, drought, locust and disease outbreak alerts from verified sources.</li>
      <li><strong>Climate Information</strong> — Seasonal forecasts and weather advisories from verified meteorological agencies.</li>
      <li><strong>Community Services</strong> — Water point status, pasture conditions, and humanitarian assistance information.</li>
      <li><strong>Multi-Channel Access</strong> — The website (also offline), alert notifications on phones, community radio and toll-free hotlines.</li>
      <li><strong>Cross-Border Coordination</strong> — Joint Kenya-Uganda platform for coordinated climate response.</li>
      <li><strong>Verified Information</strong> — All advisories published by authorized government agencies and verified partners.</li>
    </ul>
  `.trim(),
};

export const fallbackHero = {
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

export const partnerTypeColors = {
  'Met Agency': '#2E7BB4',
  Government: '#2E8B57',
  'UN Agency': '#3D2B1F',
  'Regional Body': '#6B4226',
  Research: '#B8860B',
  NGO: '#7B3FA8',
  Various: '#9A9A9A',
};

export const fallbackContactPage = {
  title: 'Contact Us',
  subtitle: 'Reach regional offices, climate agencies, and partner organisations across Turkana and Karamoja.',
  intro: 'Use the form below for general enquiries, or contact a regional office or partner organisation directly.',
  featuredImage: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1400&q=70',
  formTitle: 'Send us a message',
  formIntro: `We route enquiries to the ${APP_NAME} coordination team. For emergencies, use the numbers listed under Regional Offices.`,
  formRecipient: '',
  offices: [
    {
      name: 'Turkana Regional Office',
      region: 'Turkana, Kenya',
      address: 'Lodwar, Turkana County, Kenya',
      phone: '+254 (0)54 22 XXX',
      email: 'turkana@tkclimate.org',
      hours: 'Mon–Fri, 08:00–17:00 EAT',
    },
    {
      name: 'North Pokot Coordination Desk',
      region: 'North Pokot, Kenya',
      address: 'Kapenguria, North Pokot, Kenya',
      phone: '+254 (0)53 XXX XXX',
      email: 'northpokot@tkclimate.org',
      hours: 'Mon–Fri, 08:00–17:00 EAT',
    },
    {
      name: 'Moroto Regional Office',
      region: 'Moroto, Uganda',
      address: 'Moroto, Uganda',
      phone: '+256 XXX XXX XXX',
      email: 'moroto@tkclimate.org',
      hours: 'Mon–Fri, 08:00–17:00 EAT',
    },
  ],
  contacts: [
    {
      organization: 'Directorate of Climate Change',
      role: 'National climate policy & coordination',
      name: '',
      phone: '',
      email: '',
      country: 'Kenya',
      website: '',
    },
    {
      organization: 'Kenya Meteorological Department (MET)',
      role: 'Weather forecasts & climate outlooks',
      name: '',
      phone: '',
      email: '',
      country: 'Kenya',
      website: '',
    },
    {
      organization: 'NDMA',
      role: 'Drought management & early warning',
      name: '',
      phone: '',
      email: '',
      country: 'Kenya',
      website: '',
    },
    {
      organization: 'Danish Refugee Council (DRC)',
      role: 'Karamoja Strong (KSP) — Hub commissioning partner',
      name: '',
      phone: '',
      email: '',
      country: 'Regional',
      website: '',
    },
  ],
  social: [
    { network: 'Facebook', url: '', label: `${APP_NAME} on Facebook` },
    { network: 'LinkedIn', url: '', label: `${APP_NAME} on LinkedIn` },
    { network: 'Twitter/X', url: '', label: `${APP_NAME} on X` },
  ],
};
