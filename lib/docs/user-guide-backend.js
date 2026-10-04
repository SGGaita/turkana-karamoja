import { docImage, DOC_IMAGE_PATHS as P } from './image-placeholders';
import { APP_NAME, APP_FULL_NAME } from '../branding';

export const userGuideBackendSections = [
  {
    id: 'overview',
    title: 'Overview',
    paragraphs: [
      `The ${APP_NAME} backend is a headless WordPress installation that serves as the content management system (CMS) and partner portal API. Administrators manage content through wp-admin; partner organisations interact through the Next.js frontend portal.`,
      'This guide covers WordPress administration, content publishing workflows, organisation approval, and day-to-day CMS operations.',
    ],
    images: [
      docImage(
        P.backend.wpDashboard,
        'Figure 1: WordPress admin dashboard with TK Hub menu items.',
        'wp-admin home screen showing custom post types and TK Hub sidebar menu.',
      ),
    ],
  },
  {
    id: 'access',
    title: 'Accessing the WordPress Admin',
    steps: [
      'Open your WordPress admin URL (e.g. http://localhost/karamoja-cluster-fe/wp-admin for local XAMPP).',
      'Sign in with your administrator credentials.',
      'The dashboard shows posts, custom content types, and TK Hub settings added by the platform plugins.',
    ],
    note: 'Only authorised administrators and editors should have wp-admin access. Partner organisations use the frontend portal at /partners-stakeholders — they do not need wp-admin accounts unless assigned editor roles.',
  },
  {
    id: 'content-types',
    title: 'Content Types (Custom Post Types)',
    paragraphs: ['The platform uses the following custom post types, registered via Custom Post Type UI or the TK Partner Portal plugin:'],
    table: [
      ['Post Type', 'Slug', 'Purpose'],
      ['Alert / Advisory', 'tk_alert', 'Early warnings and climate advisories'],
      ['Report / Document', 'tk_report', 'Situation reports, studies, and downloadable files'],
      ['Initiative', 'tk_initiative', 'Climate and resilience initiatives on the homepage'],
      ['Organization', 'tk_organization', 'Partner organisation profiles'],
      ['Programme', 'tk_programme', 'Community programmes and services'],
      ['Posts (standard)', 'post', 'News bulletins and community initiative articles'],
    ],
  },
  {
    id: 'publishing-advisories',
    title: 'Publishing & Reviewing Advisories',
    steps: [
      'Partner organisations submit advisories via the frontend portal (Partners & Stakeholders → Submit Advisory).',
      'All portal submissions are automatically set to Pending Review status — they do not go live immediately.',
      'In wp-admin, go to Alerts (tk_alert) and filter by Pending to see new submissions.',
      'Review the advisory content, severity level, affected area, recommended actions, and attachments.',
      'Click Publish to make the advisory live on the frontend, or move to Draft/Reject if changes are needed.',
      'For emergency RED-level alerts, administrators may fast-track publication with post-publication review.',
    ],
    bullets: [
      'Alert levels: red, orange, yellow, green (stored in ACF field alert_level)',
      'Each advisory includes: area, body text, recommended actions, source, issued date, valid until',
      'Attachments uploaded by partners appear as media linked to the post',
    ],
    images: [
      docImage(
        P.backend.alertsPending,
        'Figure 2: Alerts list filtered to Pending status in wp-admin.',
        'All Alerts screen with Status filter set to Pending.',
      ),
      docImage(
        P.backend.alertReview,
        'Figure 3: Advisory edit screen showing ACF fields and Publish action.',
        'Single tk_alert edit page with alert_level, area, body, and actions fields visible.',
      ),
    ],
  },
  {
    id: 'publishing-reports',
    title: 'Publishing & Reviewing Reports',
    steps: [
      'Partners submit reports via the portal (Submit Report section).',
      'Reports arrive in Pending status in wp-admin under Reports (tk_report).',
      'Verify the description, categories, keywords, and attached files (PDF, Word, Excel, images).',
      'Ensure the description ACF field is populated — without it, reports appear without summary text.',
      'Publish when content is verified and accurate.',
    ],
    note: 'The tk_report post type must have both Editor and Excerpt support enabled for descriptions to save correctly.',
    images: [
      docImage(
        P.backend.reportsPending,
        'Figure 4: Reports list with pending submissions awaiting review.',
        'Reports (tk_report) admin list showing pending items.',
      ),
    ],
  },
  {
    id: 'organization-approval',
    title: 'Organisation Registration & Approval',
    steps: [
      'When an organisation registers on the frontend, a new tk_organization entry is created with status Pending.',
      'In wp-admin → Organizations, review the application: name, contact, org type, country.',
      'Click Approve to activate the organisation — this creates a WordPress user account and sends a password-setup email.',
      'Click Reject to decline with an optional reason (the applicant can re-register).',
      'Approved organisations can sign in at /partners-stakeholders and submit content.',
    ],
    bullets: [
      'Each approved org receives a unique reference (e.g. TK-ORG-000012)',
      'Organisation status can be checked via GET /wp-json/tk/v1/organization-status?email=',
      'Partners can track their submissions (pending, approved, rejected, withdrawn) in the portal dashboard',
    ],
    images: [
      docImage(
        P.backend.orgApproval,
        'Figure 5: Organisation approval screen with Approve/Reject actions.',
        'Organizations admin showing a pending registration with approval buttons.',
      ),
    ],
  },
  {
    id: 'site-header',
    title: 'Site Header & Navigation Settings',
    paragraphs: [
      'Navigation links, branding, and top bar content are managed through the TK Hub Site Header settings in wp-admin (provided by the turkana-headless-hub mu-plugin).',
    ],
    steps: [
      'Go to TK Hub → Site Header in wp-admin.',
      'Configure branding: title, tagline, logo.',
      'Set top bar links: Login/Register (/partners-stakeholders), API Access (/help/technical#api-reference), Help (/help).',
      'Configure main navigation links and the Alerts CTA button.',
      'Save changes — the Next.js frontend fetches updates from GET /wp-json/tk/v1/site-header.',
    ],
    note: 'If Help or API Access links point to #, update them to the correct frontend routes as shown above.',
    images: [
      docImage(
        P.backend.siteHeader,
        'Figure 6: TK Hub Site Header settings — branding, top bar, and nav links.',
        'TK Hub → Site Header admin page with all fields visible.',
      ),
    ],
  },
  {
    id: 'homepage-hero',
    title: 'Homepage Hero & About Page',
    bullets: [
      'Homepage hero content: TK Hub → Hero settings → served via GET /wp-json/tk/v1/hero',
      'About page: standard WordPress Page with slug "about" → GET /wp-json/wp/v2/pages?slug=about',
      'Contact page data: TK Hub → Contact settings → GET /wp-json/tk/v1/contact',
      'Initiatives and programmes: managed as tk_initiative and tk_programme posts',
    ],
    images: [
      docImage(
        P.backend.heroSettings,
        'Figure 7: TK Hub Hero settings for the homepage.',
        'TK Hub → Hero admin screen with title, metrics, and quick facts fields.',
      ),
    ],
  },
  {
    id: 'acf-fields',
    title: 'ACF Field Configuration',
    paragraphs: [
      'Advanced Custom Fields (ACF) stores structured metadata for each content type. ACF to REST API exposes these fields in WordPress REST responses consumed by the frontend.',
    ],
    table: [
      ['Post Type', 'Key Fields'],
      ['tk_alert', 'alert_level, area, body, actions (repeater), source, issued_date, valid_until'],
      ['tk_report', 'tag, categories, description, keywords, report_files, partner_orgs, publication_date'],
      ['tk_organization', 'abbreviation, org_type, country_flag, portal_url'],
      ['tk_initiative', 'tag, tag_color, description, image_url'],
      ['tk_programme', 'emoji_icon, description, languages, color'],
    ],
    note: 'See planning/wordpress-setup-checklist.md in the repository for the complete ACF field specification.',
    images: [
      docImage(
        P.backend.acfFields,
        'Figure 8: ACF field group configuration for tk_alert or tk_report.',
        'Custom Fields → Field Groups — show field list for an alert or report group.',
      ),
    ],
  },
  {
    id: 'plugins',
    title: 'Required Plugins',
    table: [
      ['Plugin', 'Purpose'],
      ['Custom Post Type UI', 'Register custom post types (if not using plugin fallback)'],
      ['Advanced Custom Fields (ACF)', 'Structured meta fields per content type'],
      ['ACF to REST API', 'Expose ACF fields in /wp-json responses'],
      ['JWT Authentication for WP REST API', 'Partner login and authenticated API calls'],
      ['TK Partner Portal', 'Organisation registration, approval workflow, submission management'],
      ['WP CORS (or functions.php)', 'Allow Next.js origin with Authorization header'],
    ],
    images: [
      docImage(
        P.backend.plugins,
        'Figure 9: Installed plugins list with required plugins activated.',
        'Plugins → Installed Plugins — highlight TK Partner Portal, JWT Auth, ACF.',
      ),
    ],
  },
  {
    id: 'user-roles',
    title: 'User Roles & Permissions',
    bullets: [
      'Administrator — Full wp-admin access, organisation approval, content review and publishing',
      'Editor — Can create and publish tk_alert and tk_report content',
      'Partner (custom) — Created on org approval; authenticated via JWT for portal submissions only',
      'Public — Read-only access to published content via REST API; no authentication required',
    ],
  },
  {
    id: 'contact-submissions',
    title: 'Contact Form Submissions',
    paragraphs: [
      'Contact form submissions from the frontend are sent to POST /wp-json/tk/v1/contact-submit and stored for administrator review. Check wp-admin for contact enquiry notifications or the configured email destination.',
    ],
  },
  {
    id: 'maintenance',
    title: 'Routine Maintenance',
    steps: [
      'Review pending advisories and reports daily (more frequently during emergencies).',
      'Approve or reject new organisation registrations promptly.',
      'Keep WordPress core, plugins, and PHP updated on the server.',
      'Verify REST API endpoints respond correctly after updates (see Technical Documentation).',
      'Back up the database and wp-content/uploads regularly.',
      'Monitor JWT secret key security — never expose wp-config.php secrets.',
    ],
  },
];
