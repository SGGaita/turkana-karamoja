/**
 * Helper for documentation image placeholders.
 * Drop PNG/JPG files into public/docs/images/{guide}/ and set `src` below.
 */
export function docImage(webPath, caption, hint, alt = '', options = {}) {
  return {
    src: webPath,
    suggestedPath: webPath ? `public${webPath}` : 'public/docs/images/…',
    alt: alt || caption,
    caption,
    hint,
    ...options,
  };
}

/** Base paths — files go in public/docs/images/ */
export const DOC_IMAGE_PATHS = {
  frontend: {
    homepage: '/images/docs/landingpage.png',
    navigation: '/docs/images/frontend/navigation.png',
    earlyWarningsList: '/docs/images/frontend/early-warnings-list.png',
    earlyWarningsDetail: '/docs/images/frontend/early-warnings-detail.png',
    reportsList: '/docs/images/frontend/reports-list.png',
    reportsDetail: '/docs/images/frontend/reports-detail.png',
    community: '/docs/images/frontend/community.png',
    organizations: '/docs/images/frontend/organizations.png',
    contact: '/docs/images/frontend/contact-form.png',
    mobile: '/docs/images/frontend/mobile-view.png',
    partnerPortal: '/docs/images/frontend/partner-portal.png',
    partnerRegister: '/docs/images/frontend/partner-register.png',
  },
  backend: {
    wpDashboard: '/docs/images/backend/wp-dashboard.png',
    alertsPending: '/docs/images/backend/alerts-pending.png',
    alertReview: '/docs/images/backend/alert-review.png',
    reportsPending: '/docs/images/backend/reports-pending.png',
    orgApproval: '/docs/images/backend/org-approval.png',
    siteHeader: '/docs/images/backend/site-header-settings.png',
    heroSettings: '/docs/images/backend/hero-settings.png',
    acfFields: '/docs/images/backend/acf-fields.png',
    plugins: '/docs/images/backend/plugins-list.png',
  },
  technical: {
    architecture: '/docs/images/technical/architecture-diagram.png',
    projectStructure: '/docs/images/technical/project-structure.png',
    envFile: '/docs/images/technical/env-local.png',
    localSetup: '/docs/images/technical/local-dev-setup.png',
    apiBrowser: '/docs/images/technical/api-browser-test.png',
    authFlow: '/docs/images/technical/auth-flow-diagram.png',
    deployment: '/docs/images/technical/deployment-overview.png',
  },
};
