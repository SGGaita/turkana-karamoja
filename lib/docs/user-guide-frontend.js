import { docImage, DOC_IMAGE_PATHS as P } from './image-placeholders';
import { APP_NAME, APP_FULL_NAME } from '../branding';
import { platformCoverageIntro } from '../regions';

export const userGuideFrontendSections = [
  {
    id: 'overview',
    title: 'Overview',
    paragraphs: [
      platformCoverageIntro(APP_FULL_NAME),
      'The website is free to use and works on desktop computers, tablets, and mobile phones. No account is required to browse warnings, reports, or community content.',
    ],
    images: [
      docImage(
        P.frontend.homepage,
        `Figure 1: ${APP_NAME} homepage with map, warnings strip, and key sections.`,
        'Full homepage at 1440px width — include header, hero, map, and warnings strip.',
        '',
        { natural: true },
      ),
    ],
  },
  {
    id: 'navigation',
    title: 'Site Navigation',
    paragraphs: [`The main navigation bar provides access to all public sections of ${APP_NAME}:`],
    table: [
      ['Page', 'Route', 'Description'],
      ['Home', '/', 'Dashboard with map, active warnings, initiatives, and quick links'],
      ['About Karamoja', '/about', 'Mission, geographic coverage, and platform features'],
      ['Early Warnings', '/early-warnings', 'Live advisories sorted by severity (RED, ORANGE, YELLOW, GREEN)'],
      ['Community', '/community', 'Programmes, bulletins, water points, and community initiatives'],
      ['Reports', '/reports', 'Searchable library of situation reports and documents'],
      ['Contact Us', '/contact', 'Contact form and office directory'],
      ['Partners & Stakeholders', '/partners-stakeholders', 'Partner portal for registered organisations'],
      ['Organizations', '/organizations', 'Directory of verified partner organisations'],
    ],
    note: 'The top bar (above the main navigation) includes language selection, Login/Register, API Access, and Help links.',
    images: [
      docImage(
        P.frontend.navigation,
        'Figure 2: Main navigation bar and top bar with Help, Login/Register, and language selector.',
        'Crop to header area — highlight nav links and top bar items.',
      ),
    ],
  },
  {
    id: 'early-warnings',
    title: 'Using Early Warnings',
    paragraphs: [
      `Early Warnings is the core alert system of ${APP_NAME}. Advisories are colour-coded by severity and updated as events develop.`,
    ],
    bullets: [
      'RED — Severe or extreme impact; immediate action required',
      'ORANGE — High risk; prepare and monitor closely',
      'YELLOW — Moderate risk or watch condition',
      'GREEN — Normal conditions or informational update',
    ],
    steps: [
      'Open Early Warnings from the main navigation or click the Alerts button in the header.',
      'Browse the list of active advisories — the most severe alerts appear first.',
      'Click any advisory to read the full text, recommended actions, affected area, and issuing source.',
      'Use the map on the homepage to see geographic coverage of active warnings.',
    ],
    images: [
      docImage(
        P.frontend.earlyWarningsList,
        'Figure 3: Early Warnings listing page with colour-coded severity badges.',
        'Show at least two advisories with different severity levels (RED, ORANGE, etc.).',
      ),
      docImage(
        P.frontend.earlyWarningsDetail,
        'Figure 4: Individual advisory detail page with recommended actions and source.',
        'Open any advisory and capture the full detail view including actions list.',
      ),
    ],
  },
  {
    id: 'reports',
    title: 'Browsing Reports & Documents',
    steps: [
      'Navigate to Reports from the main menu.',
      'Use the search box to find reports by title, keyword, or organisation name.',
      'Filter by category (food security, water, health, etc.) if filters are available.',
      'Click a report card to open the full detail page with download links.',
      'Preview PDF documents in the built-in viewer where supported.',
    ],
    note: 'Reports are published by verified partner organisations and reviewed by platform administrators before going live.',
    images: [
      docImage(
        P.frontend.reportsList,
        'Figure 5: Reports library with search and category filters.',
        'Include search bar and at least three report cards visible.',
      ),
      docImage(
        P.frontend.reportsDetail,
        'Figure 6: Report detail page with description and download options.',
        'Open a report with attached PDF and show the preview/download area.',
      ),
    ],
  },
  {
    id: 'community',
    title: 'Community Services',
    paragraphs: [
      'The Community page aggregates programmes, bulletins, water point status, humanitarian assistance locations, and community radio information relevant to the Turkana–Karamoja border region.',
    ],
    bullets: [
      'Programmes — Ongoing climate and resilience initiatives by partner organisations',
      'Bulletins — News and updates from the humanitarian and climate community',
      'Community Initiatives — Grassroots projects and local activities',
      'Water Points — Status of boreholes, pans, dams, and water trucking locations',
      'Radio Broadcasts — Daily advisory schedules on Turkana FM, Radio Karamoja, and other stations',
    ],
    images: [
      docImage(
        P.frontend.community,
        'Figure 7: Community page showing programmes, bulletins, and service sections.',
        'Capture the full page or scroll and stitch key sections (programmes + water points).',
      ),
    ],
  },
  {
    id: 'organizations',
    title: 'Organization Directory',
    steps: [
      'Visit Organizations from the navigation or About page links.',
      'Browse verified partner organisations contributing advisories and reports.',
      'Click an organisation to view their profile, published advisories, and document library.',
    ],
    images: [
      docImage(
        P.frontend.organizations,
        'Figure 8: Verified organisations directory and organisation profile page.',
        'Show the org list grid; optionally add a second screenshot of a single org profile.',
      ),
    ],
  },
  {
    id: 'contact',
    title: 'Contact & Support',
    steps: [
      'Go to Contact Us to send a message through the contact form.',
      'Fill in your name, email, organisation (optional), subject, and message.',
      'Submit the form — your enquiry is sent to the platform coordination team.',
      'For emergencies, use the toll-free hotline 1192 (Kenya) rather than the web form.',
    ],
    images: [
      docImage(
        P.frontend.contact,
        'Figure 9: Contact form and office directory.',
        'Show the contact form fields and office/contact details below.',
      ),
    ],
  },
  {
    id: 'mobile-pwa',
    title: 'Mobile Access & Offline Mode',
    bullets: [
      'The site is fully responsive — use any modern browser on your phone or tablet.',
      'Add the site to your home screen for quick access (browser menu → Add to Home Screen).',
      'The platform supports Progressive Web App (PWA) features including offline cached content when connectivity is limited.',
      'An offline indicator appears at the bottom of the screen when you lose connection.',
    ],
    images: [
      docImage(
        P.frontend.mobile,
        `Figure 10: Mobile view of ${APP_NAME} (responsive layout).`,
        'Use browser dev tools at 390px width or capture from a real phone.',
        'Mobile homepage or Early Warnings on phone',
      ),
    ],
  },
  {
    id: 'languages',
    title: 'Languages',
    paragraphs: [
      'The web platform is currently displayed in English. Community radio broadcasts and SMS alerts are available in Turkana, Ngakarimojong, Swahili, and English. Multi-language web support is planned for a future release.',
      'The language selector in the top bar shows available languages; full switching will be enabled in a future update.',
    ],
  },
  {
    id: 'partner-portal-intro',
    title: 'Partner Portal (Organisations)',
    paragraphs: [
      'If you represent a humanitarian, government, or research organisation, visit Partners & Stakeholders to register and submit advisories or reports. See the Backend & Admin Guide for the full registration and submission workflow.',
    ],
    steps: [
      'Click Login / Register in the top bar or Partners & Stakeholders in the main nav.',
      'Register your organisation with contact details and organisation type.',
      'Wait for administrator approval — you will receive an email to set your password.',
      'Sign in and use the dashboard to submit advisories, reports, and track submission status.',
    ],
    images: [
      docImage(
        P.frontend.partnerRegister,
        'Figure 11: Organisation registration form.',
        'Partners & Stakeholders page with registration form visible.',
      ),
      docImage(
        P.frontend.partnerPortal,
        'Figure 12: Partner dashboard after login — overview, submissions, and submit actions.',
        'Log in as an approved partner and capture the dashboard with sidebar navigation.',
      ),
    ],
  },
];
