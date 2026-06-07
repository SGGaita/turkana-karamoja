/**
 * Static fallback content when WordPress is unset or unreachable.
 * Single source of truth - UI imports from here or via lib/wordpress.js.
 */

export const fallbackSiteHeader = {
  branding: {
    title: 'Turkana – Karamoja',
    tagline: 'Climate Hub',
    logoUrl: '',
  },
  topbar: {
    statusText: 'LIVE SYSTEM · Turkana–Karamoja Climate Hub',
    links: [
      { label: 'Login / Register', href: '#' },
      { label: 'Help', href: '/help' },
    ],
  },
  navLinks: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Early Warnings', href: '/early-warnings' },
    { label: 'Community', href: '/community' },
    { label: 'Reports', href: '/reports' },
    { label: 'Submit Advisory', href: '/submit' },
  ],
  cta: { label: 'Alerts', href: '/early-warnings' },
};

export const fallbackHero = {
  eyebrow: 'Kenya · Uganda · Live updates',
  title: 'Turkana–Karamoja',
  titleAccent: 'Climate Hub',
  subtitle:
    'Trusted weather warnings, food and water updates, and community guidance for pastoral families across Turkana and Karamoja - in one place, in clear language.',
  backgroundImage: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600&q=80',
  primaryCta: { label: "See today's warnings", href: '/early-warnings' },
  secondaryCta: { label: 'How this hub helps', href: '#about' },
  overview: {
    title: "What's happening now",
    subtitle: 'A simple snapshot - no technical terms',
    footer:
      'Rainy season (Apr–Jun): Rains may be lighter than usual. Plan water, pasture, and food early.',
    metrics: [
      { val: '38°C', label: 'Hottest today', sub: 'Lodwar area - stay hydrated', color: '#D4A96A' },
      { val: '3', label: 'Warnings active', sub: '1 very serious · 2 need attention', color: '#E87010' },
      { val: '2.4M', label: 'People reached', sub: 'Turkana (Kenya) & Karamoja (Uganda)', color: '#D4A96A' },
      { val: 'High', label: 'Hunger risk', sub: 'Many families short of food this season', color: '#D63030' },
    ],
  },
  quickFacts: [
    { label: "Today's heat", value: 'Up to 38°C', detail: 'Lodwar · day and night range 24–38°C' },
    { label: 'Rain (24 hrs)', value: 'Little or none', detail: 'Below what is normal for April' },
    { label: 'Grass for animals', value: 'Thin', detail: 'Pasture about two-thirds of normal' },
    { label: 'Water & safety', value: '3 warnings', detail: 'Floods, dry spell, and disease watch' },
  ],
};

export const fallbackAlerts = [
  {
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
  },
  {
    level: 'ORANGE',
    color: '#E87010',
    bg: '#FFF4EC',
    title: 'Drought Stress Alert',
    area: 'Turkana North, Turkana Central, Kotido & Kaabong Districts',
    body: 'Cumulative rainfall deficits over March–April have placed pasture and water resources under severe stress. NDVI monitoring shows below-average vegetation cover. Livestock body condition declining. Accelerated destocking recommended. Emergency water trucking is being assessed.',
    source: 'NDMA Kenya / OPM Uganda',
    issued: '08 Apr 2026',
    valid: 'Ongoing - review 30 Apr',
    actions: ['Accelerate destocking', 'Activate emergency water trucking', 'Monitor livestock body condition', 'Engage NDMA for emergency support'],
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  { iconBg: '#E0EFF8', tag: 'SITREP', tagColor: '#2E7BB4', title: 'Turkana–Karamoja Humanitarian Situation Report - March 2026', desc: 'Comprehensive situation analysis covering food security, nutrition, WASH, livelihoods and displacement. Prepared jointly by OCHA Kenya & Uganda.', orgs: ['OCHA'], date: '31 Mar 2026', isNew: true, size: '3.2 MB', fileUrl: null },
  { iconBg: '#E0F5E9', tag: 'Assessment', tagColor: '#2E8B57', title: 'Climate Change Vulnerability Assessment - Turkana County 2025', desc: 'Household-level vulnerability scoring, climate risk mapping and adaptation priorities for Turkana\'s 10 sub-counties.', orgs: ['County Gov', 'NDMA'], date: 'Dec 2025', isNew: false, size: '5.8 MB', fileUrl: null },
  { iconBg: '#FFF0E0', tag: 'HAP', tagColor: '#E87010', title: 'Humanitarian Action Plan (HAP) - Karamoja 2026', desc: 'Joint response plan for Karamoja sub-region covering food assistance, nutrition, health and livelihoods. With funding requirements and gaps.', orgs: ['OPM', 'OCHA'], date: 'Jan 2026', isNew: false, isUpdated: true, size: '4.1 MB', fileUrl: null },
  { iconBg: '#E0EFF8', tag: 'Monitoring', tagColor: '#2E7BB4', title: 'NDVI & Rangeland Monitoring Report - Q1 2026', desc: 'Satellite-derived vegetation health, normalised rainfall anomaly and pasture biomass analysis for Turkana and Karamoja.', orgs: ['RCMRD', 'SERVIR'], date: 'Mar 2026', isNew: false, size: '2.7 MB', fileUrl: null },
  { iconBg: '#E0F5E9', tag: 'WASH', tagColor: '#2E8B57', title: 'WASH Cluster Bulletin - Cross-Border Water Security', desc: 'Water point functionality, access and quality monitoring for pastoral communities in the Turkana–Karamoja border zone.', orgs: ['UNICEF'], date: 'Feb 2026', isNew: false, size: '1.9 MB', fileUrl: null },
  { iconBg: '#FFF0E0', tag: 'Livelihoods', tagColor: '#E87010', title: 'Livestock Market Assessment - Turkana & Karamoja Q1 2026', desc: 'Cross-border livestock market analysis, trade flow monitoring, price trends, and terms-of-trade for pastoral households.', orgs: ['FAO', 'IGAD'], date: 'Feb 2026', isNew: false, size: '2.4 MB', fileUrl: null },
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
  { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80', title: 'Weather Advisories for Herders', desc: 'Grazing area conditions, pasture status, water point availability, and movement guidance for pastoral communities.', langs: ['Turkana', 'Swahili', 'English'], color: '#2E7BB4' },
  { img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=700&q=80', title: 'Water Point Status Map', desc: 'Real-time status of boreholes, pans, dams and water trucking points across Turkana and Karamoja.', langs: ['Ngakarimojong', 'Swahili', 'English'], color: '#2E7BB4' },
  { img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&q=80', title: 'Health & Nutrition Alerts', desc: 'Acute malnutrition rates, disease outbreaks, health facility status, and vaccination campaigns in your area.', langs: ['All Languages'], color: '#D63030' },
  { title: 'Farming & Planting Calendar', desc: 'Climate-smart agriculture advisories, seasonal planting guides, and agro-dealer locations for Turkana and Karamoja.', langs: ['Turkana', 'Teso'], color: '#2E8B57' },
  { title: 'Report an Emergency', desc: 'Community members can report disasters, conflicts, disease outbreaks or unusual environmental events to responsible authorities.', langs: ['TOLL FREE: 1192'], color: '#D63030' },
  { title: 'Humanitarian Assistance Locator', desc: 'Find food distribution points, NFI distribution, cash transfer locations and registration sites near you.', langs: ['WFP', 'UNHCR', 'UNICEF'], color: '#E87010' },
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
  { name: 'Radio Karamoja', freq: '107.3 FM', lang: 'Ngakarimojong / Ateso', times: '07:00 & 18:00 EAT' },
  { name: 'Rhino Radio Uganda', freq: '102.0 FM', lang: 'English / Swahili', times: '08:00 & 17:00 EAT' },
];

export const fallbackPartners = [
  { abbr: 'KMD', name: 'Kenya Meteorological Department', type: 'Met Agency', country: 'KE' },
  { abbr: 'UMA', name: 'Uganda Meteorological Authority', type: 'Met Agency', country: 'UG' },
  { abbr: 'NDMA', name: 'National Drought Management Authority', type: 'Government', country: 'KE' },
  { abbr: 'OPM', name: 'Office of the Prime Minister - Disaster Preparedness', type: 'Government', country: 'UG' },
  { abbr: 'OCHA', name: 'UN Office for Coordination of Humanitarian Affairs', type: 'UN Agency', country: 'INT' },
  { abbr: 'FAO', name: 'Food and Agriculture Organization', type: 'UN Agency', country: 'INT' },
  { abbr: 'ICPAC', name: 'IGAD Climate Prediction & Application Centre', type: 'Regional Body', country: 'INT' },
  { abbr: 'UNICEF', name: 'UN Children\'s Fund', type: 'UN Agency', country: 'INT' },
  { abbr: 'WFP', name: 'World Food Programme', type: 'UN Agency', country: 'INT' },
  { abbr: 'UNHCR', name: 'UN Refugee Agency', type: 'UN Agency', country: 'INT' },
  { abbr: 'RCMRD', name: 'Regional Centre for Mapping of Resources for Development', type: 'Research', country: 'INT' },
  { abbr: 'DLCO-EA', name: 'Desert Locust Control Org. for Eastern Africa', type: 'Regional Body', country: 'INT' },
  { abbr: 'DVS', name: 'Department of Veterinary Services Kenya', type: 'Government', country: 'KE' },
  { abbr: 'NEMA', name: 'National Environment Management Authority Uganda', type: 'Government', country: 'UG' },
  { abbr: 'NRC', name: 'Norwegian Refugee Council', type: 'NGO', country: 'INT' },
  { abbr: 'IRC', name: 'International Rescue Committee', type: 'NGO', country: 'INT' },
  { abbr: 'ACF', name: 'Action Against Hunger', type: 'NGO', country: 'INT' },
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
