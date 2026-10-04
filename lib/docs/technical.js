import { docImage, DOC_IMAGE_PATHS as P } from './image-placeholders';
import { APP_FULL_NAME } from '../branding';

export const technicalSections = [
  {
    id: 'architecture',
    title: 'System Architecture',
    paragraphs: [
      `${APP_FULL_NAME} uses a headless architecture: a Next.js 15 frontend (React, MUI) communicates with a WordPress REST API backend over HTTP. Content is stored in MySQL via WordPress; the frontend renders pages using static generation, server-side rendering, and client-side fetching with offline fallback data.`,
    ],
    bullets: [
      'Frontend: Next.js 15 (Pages Router) at c:\\projects\\karamoja-cluster-fe',
      'Backend: WordPress on XAMPP at C:\\xampp\\htdocs\\karamoja-cluster-fe',
      'Communication: WordPress REST API (/wp-json/) + custom TK endpoints (/wp-json/tk/v1/)',
      'Authentication: JWT tokens (JWT Authentication for WP REST API plugin)',
      'Maps: Leaflet + react-leaflet',
      'PWA: @ducanh2912/next-pwa with Workbox service worker',
      'Push notifications: web-push via Next.js API routes',
    ],
    images: [
      docImage(
        P.technical.architecture,
        'Figure 1: System architecture diagram — Next.js frontend, WordPress API, MySQL.',
        'Create a diagram showing Frontend ↔ REST API ↔ WordPress/MySQL. Use draw.io, Excalidraw, or similar.',
      ),
    ],
  },
  {
    id: 'project-structure',
    title: 'Project Structure',
    table: [
      ['Path', 'Description'],
      ['pages/', 'Next.js routes — one file per page'],
      ['components/', 'React UI components (Layout, Navbar, forms, maps)'],
      ['lib/wordpress.js', 'WordPress API client with fallback support'],
      ['lib/wp-mappers.js', 'Transform WP REST responses to frontend data shapes'],
      ['lib/fallback-data.js', 'Static content when WordPress is unreachable'],
      ['lib/org-session.js', 'JWT session storage (sessionStorage)'],
      ['contexts/SiteHeaderContext.js', 'Global nav/branding state'],
      ['wordpress-plugin/tk-partner-portal/', 'Partner portal WordPress plugin source'],
      ['planning/', 'Setup checklists and integration specs'],
    ],
    images: [
      docImage(
        P.technical.projectStructure,
        'Figure 2: Project folder structure in VS Code or file explorer.',
        'Expand key folders: pages/, components/, lib/, wordpress-plugin/.',
      ),
    ],
  },
  {
    id: 'environment',
    title: 'Environment Variables',
    table: [
      ['Variable', 'Required', 'Description'],
      ['NEXT_PUBLIC_WP_BASE_URL', 'Yes (prod)', 'WordPress site URL, e.g. http://localhost/karamoja-cluster-fe'],
      ['NEXT_PUBLIC_VAPID_PUBLIC_KEY', 'Push only', 'Web Push VAPID public key'],
      ['VAPID_PRIVATE_KEY', 'Push only', 'Web Push VAPID private key (server-side)'],
      ['VAPID_SUBJECT', 'Push only', 'mailto: contact for push service'],
      ['PUSH_BROADCAST_SECRET', 'Push only', 'Secret for POST /api/push/broadcast'],
    ],
    code: `# .env.local example
NEXT_PUBLIC_WP_BASE_URL=http://localhost/karamoja-cluster-fe
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:admin@tkclimate.org
PUSH_BROADCAST_SECRET=your-secret`,
    images: [
      docImage(
        P.technical.envFile,
        'Figure 3: .env.local configuration file (redact secrets before sharing).',
        'Screenshot of .env.local with NEXT_PUBLIC_WP_BASE_URL set — blur private keys.',
      ),
    ],
  },
  {
    id: 'local-setup',
    title: 'Local Development Setup',
    steps: [
      'Install Node.js 18+ and run npm install in the frontend repo.',
      'Start XAMPP (Apache + MySQL) and ensure WordPress is accessible.',
      'Copy .env.example to .env.local and set NEXT_PUBLIC_WP_BASE_URL.',
      'Activate required WordPress plugins (see Backend & Admin Guide).',
      'Run npm run dev — frontend starts at http://localhost:3000.',
      'Configure CORS on WordPress to allow http://localhost:3000 with Authorization header.',
    ],
    note: 'When NEXT_PUBLIC_WP_BASE_URL is unset, the frontend uses fallback-data.js static content and shows an offline/stale indicator.',
    images: [
      docImage(
        P.technical.localSetup,
        'Figure 4: Local dev environment — XAMPP running and npm run dev terminal.',
        'Split view: XAMPP control panel (Apache/MySQL green) + terminal showing Next.js ready on :3000.',
      ),
    ],
  },
  {
    id: 'api-reference',
    title: 'API Reference — Public Read Endpoints',
    paragraphs: ['These endpoints require no authentication. Replace BASE with your WordPress URL.'],
    table: [
      ['Method', 'Endpoint', 'Description'],
      ['GET', '/wp-json/wp/v2/tk_alert?status=publish', 'Published advisories'],
      ['GET', '/wp-json/wp/v2/tk_report?status=publish', 'Published reports'],
      ['GET', '/wp-json/wp/v2/tk_initiative?status=publish', 'Initiatives'],
      ['GET', '/wp-json/wp/v2/tk_programme?status=publish', 'Community programmes'],
      ['GET', '/wp-json/wp/v2/tk_organization?status=publish', 'Organisations'],
      ['GET', '/wp-json/wp/v2/posts?status=publish', 'News and bulletins'],
      ['GET', '/wp-json/wp/v2/pages?slug=about', 'About page content'],
      ['GET', '/wp-json/tk/v1/site-header', 'Navigation and branding'],
      ['GET', '/wp-json/tk/v1/hero', 'Homepage hero content'],
      ['GET', '/wp-json/tk/v1/contact', 'Contact page data'],
      ['GET', '/wp-json/tk/v1/organizations/{id}', 'Organisation profile with related content'],
    ],
    images: [
      docImage(
        P.technical.apiBrowser,
        'Figure 5: Testing a REST endpoint in the browser or Postman.',
        'Browser tab showing JSON response from /wp-json/tk/v1/site-header or similar.',
      ),
    ],
  },
  {
    id: 'api-public-write',
    title: 'API Reference — Public Write Endpoints',
    table: [
      ['Method', 'Endpoint', 'Description'],
      ['POST', '/wp-json/tk/v1/contact-submit', 'Contact form submission'],
      ['POST', '/wp-json/tk/v1/register-organization', 'Organisation registration'],
      ['GET', '/wp-json/tk/v1/organization-status?email=', 'Check registration status'],
    ],
    code: `# Register organisation
curl -X POST "BASE/wp-json/tk/v1/register-organization" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Test NGO","contact_name":"Jane","contact_email":"jane@example.com","org_type":"NGO","country":"KE"}'`,
  },
  {
    id: 'api-authenticated',
    title: 'API Reference — Authenticated Endpoints (JWT)',
    paragraphs: ['Obtain a token via POST /wp-json/jwt-auth/v1/token, then pass Authorization: Bearer TOKEN on all requests.'],
    table: [
      ['Method', 'Endpoint', 'Description'],
      ['POST', '/wp-json/jwt-auth/v1/token', 'Login — returns JWT token'],
      ['POST', '/wp-json/wp/v2/media', 'Upload file attachment'],
      ['POST', '/wp-json/wp/v2/tk_alert', 'Submit advisory (forced to pending)'],
      ['POST', '/wp-json/wp/v2/tk_report', 'Submit report (forced to pending)'],
      ['GET', '/wp-json/tk/v1/my-submissions', 'List own submissions'],
      ['PATCH', '/wp-json/tk/v1/my-submissions/{type}/{id}', 'Update submission'],
      ['POST', '/wp-json/tk/v1/my-submissions/{type}/{id}/withdraw', 'Withdraw submission'],
      ['POST', '/wp-json/tk/v1/my-submissions/report/{id}/documents', 'Add report documents'],
      ['DELETE', '/wp-json/tk/v1/my-submissions/report/{id}/documents', 'Remove report document'],
    ],
    code: `# Login
curl -X POST "BASE/wp-json/jwt-auth/v1/token" \\
  -H "Content-Type: application/json" \\
  -d '{"username":"user@example.com","password":"PASSWORD"}'

# List submissions
curl "BASE/wp-json/tk/v1/my-submissions" \\
  -H "Authorization: Bearer TOKEN"`,
  },
  {
    id: 'api-nextjs',
    title: 'Next.js API Routes',
    table: [
      ['Route', 'Method', 'Description'],
      ['/api/push/subscribe', 'POST', 'Store browser push subscription'],
      ['/api/push/broadcast', 'POST', 'Send push notification (requires PUSH_BROADCAST_SECRET)'],
    ],
  },
  {
    id: 'data-fetching',
    title: 'Frontend Data Fetching Strategy',
    table: [
      ['Page', 'Strategy', 'Notes'],
      ['/', 'getStaticProps + ISR', 'Homepage with revalidation'],
      ['/early-warnings', 'getServerSideProps', 'Always fresh alerts'],
      ['/early-warnings/[slug]', 'getStaticPaths + getStaticProps', 'Individual advisory pages'],
      ['/reports', 'Client-side (useEffect)', 'Dynamic search and filtering'],
      ['/partners-stakeholders', 'Client-only', 'Auth state in sessionStorage'],
      ['/help/*', 'Static', 'Documentation pages'],
    ],
    note: 'All fetchers in lib/wordpress.js use fetchWithFallback() — if WordPress is down, static fallback data is served and apiStale flag is set.',
  },
  {
    id: 'authentication',
    title: 'Authentication Flow',
    steps: [
      'Organisation registers via POST /tk/v1/register-organization (public).',
      'Admin approves in wp-admin → WordPress user created → password setup email sent.',
      'Partner logs in via POST /jwt-auth/v1/token from the frontend.',
      'JWT stored in sessionStorage (tk_hub_jwt, tk_hub_user_email, tk_hub_org).',
      'Authenticated requests include Authorization: Bearer header.',
      'Logout clears sessionStorage keys.',
    ],
    note: 'Demo mode: when WordPress is not configured, partners-stakeholders.js accepts demo credentials for UI testing.',
    images: [
      docImage(
        P.technical.authFlow,
        'Figure 6: Partner authentication flow diagram.',
        'Flowchart: Register → Admin Approve → Login → JWT → Submit content.',
      ),
    ],
  },
  {
    id: 'wordpress-plugins',
    title: 'WordPress Plugin Deployment',
    steps: [
      'Copy wordpress-plugin/tk-partner-portal/ to wp-content/plugins/tk-partner-portal/',
      'Copy mu-plugins from wordpress-plugin/tk-partner-portal/mu-plugins-live/ to wp-content/mu-plugins/',
      'Activate TK Partner Portal in wp-admin → Plugins.',
      'Install and configure JWT Authentication plugin with secret in wp-config.php.',
      'Flush permalinks (Settings → Permalinks → Save).',
    ],
  },
  {
    id: 'deployment',
    title: 'Production Deployment',
    bullets: [
      'Frontend: Build with npm run build, deploy .next output to Node.js host or Vercel/Netlify.',
      'Set NEXT_PUBLIC_WP_BASE_URL to production WordPress URL.',
      'WordPress: Deploy to production server with HTTPS, configure CORS for frontend domain.',
      'Ensure JWT secret, database credentials, and push secrets are in environment variables — never in source code.',
      'Configure WordPress mail (SMTP) for organisation approval emails.',
      'Set up regular database and media backups.',
    ],
    images: [
      docImage(
        P.technical.deployment,
        'Figure 7: Production deployment overview (hosting, domains, SSL).',
        'Diagram or checklist screenshot showing frontend + WordPress + database on production servers.',
      ),
    ],
  },
  {
    id: 'pwa-push',
    title: 'PWA & Push Notifications',
    bullets: [
      'PWA configured in next.config.js via @ducanh2912/next-pwa.',
      'Service worker caches WordPress API responses for offline access.',
      'Generate VAPID keys: npx web-push generate-vapid-keys',
      'Push subscriptions stored in data/push-subscriptions.json.',
      'Broadcast via POST /api/push/broadcast with PUSH_BROADCAST_SECRET header.',
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    table: [
      ['Issue', 'Solution'],
      ['REST API returns 404', 'Flush permalinks; verify plugin is active'],
      ['CORS errors in browser', 'Add frontend origin to WP CORS config with Authorization header'],
      ['JWT login fails', 'Verify JWT secret in wp-config.php; check plugin is active'],
      ['Reports missing description', 'Add ACF description field; enable Excerpt on tk_report CPT'],
      ['Help link goes nowhere', 'Update Site Header Help href to /help in wp-admin'],
      ['Frontend shows stale data', 'Check NEXT_PUBLIC_WP_BASE_URL; verify WP is reachable'],
    ],
  },
];
