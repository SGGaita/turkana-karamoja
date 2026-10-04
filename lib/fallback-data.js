import {
  APP_NAME,
  APP_TAGLINE,
  APP_FULL_NAME,
  APP_STATUS_TEXT,
} from './branding';
import { GEO_COVERAGE_HTML, HERO_COVERAGE_SUB, platformCoverageIntro } from './regions';

/**
 * Static fallback content when WordPress is unset or unreachable.
 * Single source of truth - UI imports from here or via lib/wordpress.js.
 */

export const fallbackSiteHeader = {
  branding: {
    title: APP_NAME,
    tagline: APP_TAGLINE,
    logoUrl: '',
  },
  topbar: {
    statusText: APP_STATUS_TEXT,
    links: [
      { label: 'Login / Register', href: '/partners-stakeholders' },
      { label: 'API Access', href: '/help/technical#api-reference' },
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
    subtitle: 'Interactive view of climate monitoring stations, published advisories, and key communities across Turkana County (Lokiriama and Loima Sub-Counties) and West Pokot County (Pokot North Sub-County), Kenya; and Moroto, Amudat, and Napak Districts, Uganda — pastoral communities linked across the Kenya–Uganda frontier. Click any marker for details.',
  },
  footer: {
    metaDescription: 'Climate change knowledge and information for pastoral communities in the Karamoja Cluster.',
    columnKaramoja: 'Karamoja',
    columnServices: 'Services',
    columnRegions: 'Regions',
    columnContact: 'Contact',
    contactLink: 'Contact Us →',
    linksKaramoja: ['About Karamoja', 'Our Partners', 'Data Sources', 'API Access', 'Methodology'],
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
      <li><strong>Early Warning Systems</strong> — Real-time flood, drought, locust, and disease outbreak alerts.</li>
      <li><strong>Climate Information</strong> — Seasonal forecasts and weather advisories from verified meteorological agencies.</li>
      <li><strong>Community Services</strong> — Water point status, pasture conditions, and humanitarian assistance information.</li>
      <li><strong>Multi-Channel Access</strong> — Web platform, SMS alerts, community radio, and toll-free hotline.</li>
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
    metrics: [
      { val: '38°C', label: 'Hottest today', sub: 'Lodwar area - stay hydrated', color: '#D4A96A' },
      { val: '3', label: 'Warnings active', sub: '1 very serious · 2 need attention', color: '#E87010' },
      { val: '2.4M', label: 'People reached', sub: HERO_COVERAGE_SUB, color: '#D4A96A' },
      { val: 'High', label: 'Hunger risk', sub: 'Many families short of food this season', color: '#D63030' },
    ],
  },
};

export const fallbackAlerts = [
  {
    id: 9001,
    level: 'RED',
    color: '#D63030',
    bg: '#FFF0F0',
    title: 'Flash Flood Warning',
    area: 'Turkwel River basin (Turkana East) & Lokok River (Moroto District, Karamoja)',
    body: 'Heavy rainfall of 40–80mm expected over 48 hours. River levels are rising rapidly. Immediate risk of flash flooding. Communities in low-lying areas and near river banks should evacuate to designated safe zones. Livestock should be moved to higher ground immediately.',
    source: 'KMD / Uganda Meteorological Authority (UMA)',
    issued: '13 Apr 2026 06:00',
    valid: 'Active until 15 Apr 2026 18:00',
    actions: ['Evacuate low-lying communities', 'Move livestock to higher ground', 'Avoid crossing flooded roads', 'Monitor Turkana FM 89.5 for updates'],
    keywords: ['flood', 'evacuation', 'Turkwel'],
    files: [],
  },
  {
    id: 9002,
    level: 'ORANGE',
    color: '#E87010',
    bg: '#FFF4EC',
    title: 'Drought Stress Alert',
    area: 'Turkana, North Pokot, Napak & Amudat',
    body: 'Cumulative rainfall deficits over March–April have placed pasture and water resources under severe stress. NDVI monitoring shows below-average vegetation cover. Livestock body condition declining. Accelerated destocking recommended. Emergency water trucking is being assessed.',
    source: 'NDMA Kenya / OPM Uganda',
    issued: '08 Apr 2026',
    valid: 'Ongoing - review 30 Apr',
    actions: ['Accelerate destocking', 'Activate emergency water trucking', 'Monitor livestock body condition', 'Engage NDMA for emergency support'],
    keywords: ['drought', 'pasture', 'water'],
    files: [],
  },
  {
    id: 9003,
    level: 'ORANGE',
    color: '#E87010',
    bg: '#FFF4EC',
    title: 'Livestock Disease Outbreak Alert',
    area: 'Loima & Kibish Sub-Counties, Turkana',
    body: 'Suspected Foot and Mouth Disease (FMD) outbreak reported in livestock in Loima and Kibish. Approximately 340 cattle affected. Movement restrictions imposed on livestock from affected areas. Veterinary teams deployed.',
    source: 'DVS Kenya / Turkana County Livestock Dept',
    issued: '11 Apr 2026',
    valid: 'Active - under response',
    actions: ['Do not move livestock across sub-county boundaries', 'Report sick animals to nearest vet', 'Isolate affected herds', 'Contact DVS Kenya: 0800 720 232'],
    keywords: ['livestock', 'FMD', 'disease'],
    advisoryType: 'Disease Outbreak Alert',
    files: [],
  },
  {
    id: 9004,
    level: 'YELLOW',
    color: '#B8860B',
    bg: '#FFFBEC',
    title: 'Sandstorm / Dust Advisory',
    area: 'Turkana South, Lokichogio & Moroto Town areas',
    body: 'Sustained south-easterly winds of 30–50 km/h combined with dry soils are causing significant dust and sand transport. Reduced visibility 200–500m. Health advisory: people with respiratory conditions should avoid outdoor activity.',
    source: 'KMD Wind Advisory',
    issued: '12 Apr 2026',
    valid: 'Valid 24 hrs',
    actions: ['Avoid outdoor activity if respiratory condition exists', 'Keep livestock away from affected corridors', 'Health facilities to prepare for respiratory cases'],
    keywords: ['dust', 'wind', 'health'],
    advisoryType: 'Other',
    files: [],
  },
  {
    id: 9006,
    level: 'ORANGE',
    color: '#E87010',
    bg: '#FFF4EC',
    title: 'Acute Malnutrition Alert — Turkana North',
    area: 'Turkana North & Kibish Sub-Counties',
    body: 'Global acute malnutrition (GAM) rates have exceeded the emergency threshold of 15% in Turkana North. Stunting rates at 38%. Nutrition screening teams deployed to 24 priority villages. Therapeutic feeding centres activated at Lokichogio and Kakuma.',
    source: 'UNICEF / Turkana County Health Dept',
    issued: '05 Apr 2026',
    valid: 'Ongoing — review 15 May',
    actions: ['Take children under 5 for MUAC screening', 'Refer SAM cases to nearest health facility', 'Contact community health volunteers', 'Monitor pregnant and lactating mothers'],
    keywords: ['nutrition', 'malnutrition', 'SAM', 'health'],
    advisoryType: 'Food Security Update',
    files: [],
  },
  {
    id: 9005,
    level: 'YELLOW',
    color: '#B8860B',
    bg: '#FFFBEC',
    title: 'Wildfire Risk Advisory',
    area: 'Karamoja Highlands - Napak & Moroto Districts',
    body: 'Dry fuel loads, low humidity and strong winds elevate wildfire risk in Karamoja highlands. Avoid open burning. Communities near forested areas should be vigilant and report any fire immediately.',
    source: 'NEMA Uganda',
    issued: '12 Apr 2026',
    valid: 'Valid 72 hrs',
    actions: ['No open burning', 'Report fires immediately to NEMA Uganda', 'Keep firebreaks clear around settlements'],
    keywords: ['wildfire', 'Napak', 'Moroto'],
    files: [],
  },
  {
    id: 9006,
    level: 'GREEN',
    color: '#2E8B57',
    bg: '#F0FFF6',
    title: 'Desert Locust Watch - Clear',
    area: 'All Sub-Counties, Turkana & Karamoja',
    body: 'Current monitoring shows no significant Desert Locust breeding or swarm activity. Ground survey teams reported normal hopperband levels. Situation remains under watch given seasonal rains that could stimulate breeding.',
    source: 'FAO / DLCO-EA',
    issued: '10 Apr 2026',
    valid: 'Under regular monitoring',
    actions: ['Report unusual locust activity to sub-county agriculture office', 'Continue monitoring during rains'],
    keywords: ['locust', 'monitoring'],
    files: [],
  },
];

export const seasonalOutlook = [
  { label: 'Rain season', val: 'March to May 2026' },
  { label: 'Expected rains', val: 'Less rain than normal' },
  { label: 'What is causing this', val: 'Changing ocean temperatures affecting our region' },
  { label: 'Issued by', val: 'ICPAC (Regional Weather Authority)' },
  { label: 'Date issued', val: 'March 2026' },
];

export const fallbackReports = [
  { id: 'demo-1', iconBg: '#E0EFF8', tag: 'SITREP', tagColor: '#2E7BB4', title: 'Turkana–Karamoja Humanitarian Situation Report - March 2026', desc: 'Comprehensive situation analysis covering food security, nutrition, WASH, livelihoods and displacement. Prepared jointly by OCHA Kenya & Uganda.', orgs: ['OCHA'], countries: ['KE', 'UG'], date: '31 Mar 2026', dateRaw: '2026-03-31', isNew: true, size: '3.2 MB', fileUrl: null },
  { id: 'demo-2', iconBg: '#E0F5E9', tag: 'Assessment', tagColor: '#2E8B57', title: 'Climate Change Vulnerability Assessment - Turkana County 2025', desc: 'Household-level vulnerability scoring, climate risk mapping and adaptation priorities for Turkana\'s 10 sub-counties.', orgs: ['County Gov', 'NDMA'], countries: ['KE'], date: 'Dec 2025', dateRaw: '2025-12-01', isNew: false, size: '5.8 MB', fileUrl: null },
  { id: 'demo-3', iconBg: '#FFF0E0', tag: 'HAP', tagColor: '#E87010', title: 'Humanitarian Action Plan (HAP) - Karamoja 2026', desc: 'Joint response plan for Karamoja sub-region covering food assistance, nutrition, health and livelihoods. With funding requirements and gaps.', orgs: ['OPM', 'OCHA'], countries: ['UG'], date: 'Jan 2026', dateRaw: '2026-01-01', isNew: false, isUpdated: true, size: '4.1 MB', fileUrl: null },
  { id: 'demo-4', iconBg: '#E0EFF8', tag: 'Monitoring', tagColor: '#2E7BB4', title: 'NDVI & Rangeland Monitoring Report - Q1 2026', desc: 'Satellite-derived vegetation health, normalised rainfall anomaly and pasture biomass analysis for Turkana and Karamoja.', orgs: ['RCMRD', 'SERVIR'], countries: ['KE', 'UG'], date: 'Mar 2026', dateRaw: '2026-03-01', isNew: false, size: '2.7 MB', fileUrl: null },
  { id: 'demo-5', iconBg: '#E0F5E9', tag: 'WASH', tagColor: '#2E8B57', title: 'WASH Cluster Bulletin - Cross-Border Water Security', desc: 'Water point functionality, access and quality monitoring for pastoral communities in the Turkana–Karamoja border zone.', orgs: ['UNICEF'], countries: ['CROSS'], date: 'Feb 2026', dateRaw: '2026-02-10', isNew: false, size: '1.9 MB', fileUrl: null },
  { id: 'demo-6', iconBg: '#FFF0E0', tag: 'Livelihoods', tagColor: '#E87010', title: 'Livestock Market Assessment - Turkana & Karamoja Q1 2026', desc: 'Cross-border livestock market analysis, trade flow monitoring, price trends, and terms-of-trade for pastoral households.', orgs: ['FAO', 'IGAD'], countries: ['CROSS'], date: 'Feb 2026', dateRaw: '2026-02-20', isNew: false, size: '2.4 MB', fileUrl: null },
];

export const reportsStats = [
  { val: 'KES 2.4B', label: 'Humanitarian Funding Mobilised', sub: '2025–2026 · Turkana + Karamoja', trend: null },
  { val: '1.2M', label: 'Beneficiaries Reached', sub: 'April 2026', trend: '↑ +18% from Mar 2026', trendUp: true },
  { val: '47', label: 'Active Partner Organisations', sub: 'NGO, Gov, UN', trend: null },
  { val: '89%', label: 'Funding Gap (HAP 2026)', sub: 'Critical underfunding', trend: 'Urgent', trendUp: false },
];

export const fundingData = [
  { sector: 'Food Security & Livelihoods', funded: 68, gap: 32, color: '#E87010' },
  { sector: 'Nutrition', funded: 52, gap: 48, color: '#D63030' },
  { sector: 'WASH', funded: 41, gap: 59, color: '#2E7BB4' },
  { sector: 'Health', funded: 55, gap: 45, color: '#2E8B57' },
  { sector: 'Shelter & NFI', funded: 23, gap: 77, color: '#B8860B' },
  { sector: 'Education', funded: 30, gap: 70, color: '#7B3FA8' },
];

export const fallbackInitiatives = [
  { img: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=700&q=80', tag: 'Drought Resilience', tagColor: '#E87010', title: 'Drought Resilient Livestock Management', desc: 'Community-led destocking programmes, emergency water trucking, and pasture conservation strategies for agropastoral households across Turkana and Karamoja.', link: '#' },
  { img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=700&q=80', tag: 'Water & WASH', tagColor: '#2E7BB4', title: 'Community Water Source Rehabilitation and Food Resilience', desc: 'Rehabilitation of boreholes, pans, and sand dams alongside household food security programmes targeting IPC Phase 3 and 4 populations.', link: '#' },
  { img: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=700&q=80', tag: 'Climate-Smart Agriculture', tagColor: '#2E8B57', title: 'Climate-Smart Agriculture Interventions', desc: 'Drought-tolerant varieties, climate-informed planting calendars, agro-dealer linkages, and irrigation micro-schemes for smallholder farmers.', link: '#' },
];

export const fallbackProgrammes = [
  { href: '/early-warnings', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80', title: 'Weather Advisories for Herders', desc: 'Grazing area conditions, pasture status, water point availability, and movement guidance for pastoral communities.', langs: ['Turkana', 'Swahili', 'English'], color: '#2E7BB4' },
  { href: '/community/water-points', img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=700&q=80', title: 'Water Point Status Map', desc: 'Real-time status of boreholes, pans, dams and water trucking points across Turkana and Karamoja.', langs: ['Ngakarimojong', 'Swahili', 'English'], color: '#2E7BB4' },
  { href: '/community/health', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&q=80', title: 'Health & Nutrition Alerts', desc: 'Acute malnutrition rates, disease outbreaks, health facility status, and vaccination campaigns in your area.', langs: ['All Languages'], color: '#D63030' },
  { href: '/community/planting-calendar', title: 'Farming & Planting Calendar', desc: 'Climate-smart agriculture advisories, seasonal planting guides, and agro-dealer locations for Turkana and Karamoja.', langs: ['Turkana', 'Swahili'], color: '#2E8B57' },
  { href: 'tel:1192', title: 'Report an Emergency', desc: 'Community members can report disasters, conflicts, disease outbreaks or unusual environmental events to responsible authorities.', langs: ['TOLL FREE: 1192'], color: '#D63030' },
  { href: '/community/assistance', title: 'Humanitarian Assistance Locator', desc: 'Find food distribution points, NFI distribution, cash transfer locations and registration sites near you.', langs: ['WFP', 'UNHCR', 'UNICEF'], color: '#E87010' },
];

export const fallbackWaterPoints = [
  { id: 'wp-1', name: 'Lodwar Central Borehole', pointType: 'borehole', status: 'functional', region: 'Turkana Central', locationLabel: 'Lodwar town', desc: 'Primary municipal borehole serving Lodwar town and surrounding pastoral camps.', lastUpdated: '28 Mar 2026', lat: 3.119, lng: 35.597 },
  { id: 'wp-2', name: 'Kakuma Pan', pointType: 'pan', status: 'partial', region: 'Turkana West', locationLabel: 'Kakuma', desc: 'Seasonal pan with reduced capacity after below-average rains.', lastUpdated: '25 Mar 2026', lat: 3.717, lng: 34.875 },
  { id: 'wp-3', name: 'Lokichogio Dam', pointType: 'dam', status: 'non_functional', region: 'Turkana North', locationLabel: 'Lokichogio', desc: 'Dam silted; emergency water trucking activated for 3 surrounding villages.', lastUpdated: '30 Mar 2026', lat: 4.207, lng: 34.348 },
  { id: 'wp-4', name: 'Kalobeyei Water Trucking Point', pointType: 'water_trucking', status: 'trucking', region: 'Turkana West', locationLabel: 'Kalobeyei', desc: 'UNICEF-supported water trucking hub — distribution Mon/Wed/Fri 08:00–14:00.', lastUpdated: '01 Apr 2026', lat: 3.785, lng: 34.62 },
  { id: 'wp-5', name: 'Moroto Town Borehole', pointType: 'borehole', status: 'functional', region: 'Moroto', locationLabel: 'Moroto town', desc: 'Functional borehole serving Moroto town and nearby agropastoral households.', lastUpdated: '27 Mar 2026', lat: 2.534, lng: 34.667 },
  { id: 'wp-6', name: 'Nakapiripirit Pan', pointType: 'pan', status: 'partial', region: 'Napak', locationLabel: 'Nakapiripirit', desc: 'Pan at 40% capacity; pastoralists advised to use Napak borehole as backup.', lastUpdated: '22 Mar 2026', lat: 1.908, lng: 34.972 },
  { id: 'wp-7', name: 'Kaabong Dam', pointType: 'dam', status: 'functional', region: 'Kaabong', locationLabel: 'Kaabong town', desc: 'Community dam with adequate water for livestock and domestic use this season.', lastUpdated: '29 Mar 2026', lat: 3.517, lng: 34.133 },
  { id: 'wp-8', name: 'Turkwel River Pump', pointType: 'borehole', status: 'functional', region: 'Turkana East', locationLabel: 'Turkwel corridor', desc: 'Solar-powered pump along Turkwel River serving pastoral migration corridor.', lastUpdated: '26 Mar 2026', lat: 3.119, lng: 35.85 },
];

export const fallbackAssistanceSites = [
  { id: 'as-1', name: 'Lodwar Food Distribution Centre', siteType: 'food_distribution', agency: 'WFP', region: 'Turkana Central', locationLabel: 'Lodwar', desc: 'General food distribution for IPC Phase 3+ households.', schedule: 'Tue & Fri 08:00–15:00', contact: 'WFP Lodwar: +254 700 000 001', lat: 3.125, lng: 35.605 },
  { id: 'as-2', name: 'Kakuma NFI Distribution', siteType: 'nfi', agency: 'UNHCR', region: 'Turkana West', locationLabel: 'Kakuma', desc: 'Non-food items — shelter materials, blankets, kitchen sets.', schedule: 'Mon–Thu 09:00–16:00', contact: 'UNHCR Kakuma office', lat: 3.72, lng: 34.88 },
  { id: 'as-3', name: 'Moroto Cash Transfer Point', siteType: 'cash_transfer', agency: 'UNICEF', region: 'Moroto', locationLabel: 'Moroto town', desc: 'Mobile money cash transfer registration and disbursement.', schedule: 'Wed 08:00–14:00', contact: 'UNICEF Moroto: 0800 111 222', lat: 2.538, lng: 34.67 },
  { id: 'as-4', name: 'Napak Registration Hub', siteType: 'registration', agency: 'WFP', region: 'Napak', locationLabel: 'Napak sub-county', desc: 'Household registration for food assistance programmes.', schedule: 'Mon–Fri 08:00–12:00', contact: 'OPM Napak liaison', lat: 1.915, lng: 34.98 },
  { id: 'as-5', name: 'Kalobeyei Nutrition Support', siteType: 'food_distribution', agency: 'UNICEF', region: 'Turkana West', locationLabel: 'Kalobeyei', desc: 'Targeted nutrition support and therapeutic feeding supplies.', schedule: 'Daily 08:00–13:00', contact: 'Health facility in-charge', lat: 3.79, lng: 34.625 },
  { id: 'as-6', name: 'Kaabong NFI & Shelter', siteType: 'nfi', agency: 'NRC', region: 'Kaabong', locationLabel: 'Kaabong', desc: 'Shelter kits and essential household items for displaced families.', schedule: 'Thu & Sat 09:00–15:00', contact: 'NRC Kaabong field office', lat: 3.52, lng: 34.14 },
];

export const fallbackPlantingAdvisories = [
  { id: 'pa-1', title: 'Sorghum — Long Rains 2026', crop: 'Sorghum', season: 'Long Rains 2026', region: 'Turkana South & Turkana East', windowStart: '2026-04-01', windowEnd: '2026-04-30', status: 'optimal', desc: 'Plant drought-tolerant varieties (Gadam, Serena). Expected below-normal rains — use zai pits and mulch.', agroDealer: 'Lodwar Agro-Dealers Association — Main Street', langs: ['Turkana', 'Swahili'] },
  { id: 'pa-2', title: 'Cowpea — Long Rains 2026', crop: 'Cowpea', season: 'Long Rains 2026', region: 'Karamoja (Moroto, Napak, Amudat)', windowStart: '2026-04-15', windowEnd: '2026-05-15', status: 'optimal', desc: 'Intercrop with sorghum for nitrogen fixation. Short-duration varieties recommended.', agroDealer: 'Moroto Farmers Cooperative input shop', langs: ['Ngakarimojong', 'Swahili'] },
  { id: 'pa-3', title: 'Green Gram — Short Rains', crop: 'Green Gram', season: 'Short Rains 2026', region: 'Turkana Central & West', windowStart: '2026-10-01', windowEnd: '2026-10-31', status: 'caution', desc: 'Prepare land early; monitor ICPAC short-rains forecast before final planting decision.', agroDealer: 'Kakuma Agro-Vet Supplies', langs: ['Turkana', 'Swahili', 'English'] },
  { id: 'pa-4', title: 'Maize — Agropastoral Zones', crop: 'Maize', season: 'Long Rains 2026', region: 'Moroto foothills & Napak', windowStart: '2026-04-01', windowEnd: '2026-04-20', status: 'caution', desc: 'Only in high-potential foothill zones with supplemental irrigation. Drought-tolerant OPV varieties only.', agroDealer: 'Napak County agro-dealer network', langs: ['Ngakarimojong', 'English'] },
];

export const fallbackNews = [
  { iconBg: '#E0EFF8', tag: 'SITREP', tagColor: '#2E7BB4', title: 'Turkana–Karamoja Humanitarian Situation Report - March 2026', desc: 'Comprehensive situation analysis covering food security, nutrition, WASH, livelihoods and displacement. Prepared jointly by OCHA Kenya & Uganda.', date: '31 Mar 2026', isNew: true, isUpdated: false },
  { iconBg: '#E0F5E9', tag: 'Assessment', tagColor: '#2E8B57', title: 'Climate Change Vulnerability Assessment - Turkana County 2025', desc: 'Household-level vulnerability scoring, climate risk mapping and adaptation priorities for Turkana\'s 10 sub-counties.', date: 'Dec 2025', isNew: false, isUpdated: false },
  { iconBg: '#FFF0E0', tag: 'HAP', tagColor: '#E87010', title: 'Humanitarian Action Plan (HAP) - Karamoja 2026', desc: 'Joint response plan for Karamoja sub-region covering food assistance, nutrition, health and livelihoods. With funding requirements and gaps.', date: 'Jan 2026', isNew: false, isUpdated: true },
  { iconBg: '#E0EFF8', tag: 'Monitoring', tagColor: '#2E7BB4', title: 'NDVI & Rangeland Monitoring Report - Q1 2026', desc: 'Satellite-derived vegetation health, normalised rainfall anomaly and pasture biomass analysis for Turkana and Karamoja.', date: 'Mar 2026', isNew: false, isUpdated: false },
];

export const newsStats = [
  { val: 'KES 2.4B', label: 'Humanitarian Funding Mobilised 2025–2026' },
  { val: '1.2M', label: 'Beneficiaries Reached Apr 2026' },
  { val: '47', label: 'Active Partner Organisations' },
  { val: '89%', label: 'Funding Gap (HAP 2026)' },
];

export const fallbackBulletins = [
  { title: 'Flood Preparedness Bulletin - Turkwel River Communities', desc: 'Guidance for communities in Turkwel, Nakwamoru and Kalobeyei on safe evacuation routes, livestock movement and emergency contacts.', tag: 'Community', date: '13 Apr 2026', urgent: true },
  { title: 'Livestock Movement Advisory - Dry Season 2026', desc: 'Recommended migration corridors, water point locations and conflict-sensitive movement guidance for pastoralists.', tag: 'Pastoralism', date: '05 Apr 2026', urgent: false },
  { title: 'Agro-Pastoral Planting Advisory - Long Rains 2026', desc: 'Recommended sorghum and cowpea planting windows, input linkages and climate-smart practices for the upcoming season.', tag: 'Agriculture', date: '01 Apr 2026', urgent: false },
  { title: 'Water Point Functionality Update - March 2026', desc: '47 boreholes across Turkana North reported non-functional. Emergency water trucking activated for 12 priority sub-locations.', tag: 'WASH', date: '28 Mar 2026', urgent: false },
];

export const radioStations = [
  { name: 'Turkana FM', freq: '89.5 FM', lang: 'Turkana / Swahili', times: '07:00 & 18:00 EAT' },
  { name: 'Lodwar Community Radio', freq: '90.3 FM', lang: 'Turkana / English', times: '06:30 & 19:00 EAT' },
  { name: 'Radio Karamoja', freq: '107.3 FM', lang: 'Ngakarimojong / Swahili', times: '07:00 & 18:00 EAT' },
  { name: 'Rhino Radio Uganda', freq: '102.0 FM', lang: 'English / Swahili', times: '08:00 & 17:00 EAT' },
];

export const fallbackCommunityPage = {
  outreach: {
    items: [
      { country: '', region: '', label: 'SMS Alerts', description: 'Via Safaricom & MTN networks' },
      { country: '', region: '', label: 'Community Radio', description: 'Daily advisories at 07:00 & 18:00 EAT' },
      { country: 'Kenya', region: '', label: 'Toll-Free Hotline', description: 'Call 1192 (Kenya) free of charge' },
    ],
  },
  radio: {
    title: 'Partner Radio Stations',
    regions: [
      {
        country: 'Kenya',
        region: 'Turkana',
        stations: [
          { name: 'Turkana FM', freq: '89.5 FM', lang: 'Turkana / Swahili', times: '07:00 & 18:00 EAT' },
          { name: 'Lodwar Community Radio', freq: '90.3 FM', lang: 'Turkana / English', times: '06:30 & 19:00 EAT' },
        ],
      },
      {
        country: 'Kenya',
        region: 'North Pokot',
        stations: [],
      },
      {
        country: 'Uganda',
        region: 'Moroto',
        stations: [
          { name: 'Radio Karamoja', freq: '107.3 FM', lang: 'Ngakarimojong / Swahili', times: '07:00 & 18:00 EAT' },
          { name: 'Rhino Radio Uganda', freq: '102.0 FM', lang: 'English / Swahili', times: '08:00 & 17:00 EAT' },
        ],
      },
    ],
  },
};

export const fallbackPartners = [
  { id: 101, abbr: 'KMD', name: 'Kenya Meteorological Department', type: 'Met Agency', country: 'KE' },
  { id: 102, abbr: 'UMA', name: 'Uganda Meteorological Authority', type: 'Met Agency', country: 'UG' },
  { id: 103, abbr: 'NDMA', name: 'National Drought Management Authority', type: 'Government', country: 'KE' },
  { id: 104, abbr: 'OPM', name: 'Office of the Prime Minister - Disaster Preparedness', type: 'Government', country: 'UG' },
  { id: 105, abbr: 'OCHA', name: 'UN Office for Coordination of Humanitarian Affairs', type: 'UN Agency', country: 'INT' },
  { id: 106, abbr: 'FAO', name: 'Food and Agriculture Organization', type: 'UN Agency', country: 'INT' },
  { id: 107, abbr: 'ICPAC', name: 'IGAD Climate Prediction & Application Centre', type: 'Regional Body', country: 'INT' },
  { id: 108, abbr: 'UNICEF', name: 'UN Children\'s Fund', type: 'UN Agency', country: 'INT' },
  { id: 109, abbr: 'WFP', name: 'World Food Programme', type: 'UN Agency', country: 'INT' },
  { id: 110, abbr: 'UNHCR', name: 'UN Refugee Agency', type: 'UN Agency', country: 'INT' },
  { id: 111, abbr: 'RCMRD', name: 'Regional Centre for Mapping of Resources for Development', type: 'Research', country: 'INT' },
  { id: 112, abbr: 'DLCO-EA', name: 'Desert Locust Control Org. for Eastern Africa', type: 'Regional Body', country: 'INT' },
  { id: 113, abbr: 'DVS', name: 'Department of Veterinary Services Kenya', type: 'Government', country: 'KE' },
  { id: 114, abbr: 'NEMA', name: 'National Environment Management Authority Uganda', type: 'Government', country: 'UG' },
  { id: 115, abbr: 'NRC', name: 'Norwegian Refugee Council', type: 'NGO', country: 'INT' },
  { id: 116, abbr: 'IRC', name: 'International Rescue Committee', type: 'NGO', country: 'INT' },
  { id: 117, abbr: 'ACF', name: 'Action Against Hunger', type: 'NGO', country: 'INT' },
  { abbr: '+ 30', name: 'More NGOs, CBOs & Research Institutions', type: 'Various', country: 'INT' },
];

export const organizationPortals = [
  { bg: 'linear-gradient(135deg, #E0EFF8 0%, #C8E0F0 100%)', title: 'Meteorological Authorities', desc: 'KMD (Kenya Meteorological Department) and UMA (Uganda Meteorological Authority) can publish official forecasts, climate outlooks, weather advisories and seasonal updates.', actions: [{ label: 'Publish Forecast', primary: true }, { label: 'Submit Advisory', primary: false }], orgs: ['KMD', 'UMA', 'ICPAC'] },
  { bg: 'linear-gradient(135deg, #FFE8E8 0%, #FFCECE 100%)', title: 'Disaster Management', desc: 'NDMA Kenya, OPM Uganda, Turkana County Disaster Unit, and Karamoja Disaster Coordination can publish emergency alerts, response updates and situation reports.', actions: [{ label: 'Issue Alert', primary: true }, { label: 'Response Reports', primary: false }], orgs: ['NDMA', 'OPM', 'Turkana County'] },
  { bg: 'linear-gradient(135deg, #E8F5E0 0%, #CCEABD 100%)', title: 'County / Regional Government', desc: 'Turkana County Government and Karamoja Sub-Regional Coordination Office can share official policy documents, budgets, dashboards and M&E reports.', actions: [{ label: 'Govt Dashboard', primary: true }, { label: 'Reports', primary: false }], orgs: ['Turkana County Gov', 'Karamoja Coord. Office'] },
  { bg: 'linear-gradient(135deg, #F5E8FF 0%, #E8CCFF 100%)', title: 'NGOs, UN Agencies & Partners', desc: 'Registered humanitarian and development organisations can share 4Ws, response updates, needs assessments, and inter-agency coordination documents.', actions: [{ label: 'Partner Portal', primary: true }, { label: 'Coordination Hub', primary: false }], orgs: ['OCHA', 'FAO', 'UNICEF', 'WFP', 'UNHCR'] },
];

export const partnerTypeColors = {
  'Met Agency': '#2E7BB4',
  Government: '#2E8B57',
  'UN Agency': '#3D2B1F',
  'Regional Body': '#6B4226',
  Research: '#B8860B',
  NGO: '#7B3FA8',
  Various: '#9A9A9A',
};

export const weatherItems = [
  { label: 'Turkana Temp', val: '34°C' },
  { label: 'Karamoja Temp', val: '31°C' },
  { label: 'Rainfall (Apr MTD)', val: '42mm (68% of normal)' },
  { label: 'Wind', val: 'SE 18 km/h' },
];

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
