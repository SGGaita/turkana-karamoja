# Turkana-Karamoja WordPress Theme Conversion Plan

Convert the Next.js climate hub application into a full WordPress theme with custom plugins, maintaining all functionality while enabling content management through WordPress admin.

## Overview

This conversion will create:
- **Custom WordPress Theme**: Full theme with all page templates, components converted to PHP/WordPress
- **Custom Plugins**: Modular plugins for alerts, maps, reports, and community features
- **React Integration**: Embedded React components for interactive maps via shortcodes
- **Custom Post Types**: Full admin interface for managing alerts, reports, organizations, and community content

## Project Structure

```
turkana-karamoja-wp/
├── themes/
│   └── turkana-karamoja/
│       ├── style.css
│       ├── functions.php
│       ├── header.php
│       ├── footer.php
│       ├── index.php
│       ├── front-page.php
│       ├── page-*.php (templates)
│       ├── template-parts/
│       ├── inc/ (theme functions)
│       ├── assets/
│       │   ├── css/
│       │   ├── js/
│       │   └── images/
│       └── react-components/ (bundled React)
└── plugins/
    ├── tk-climate-alerts/
    ├── tk-regional-map/
    ├── tk-reports/
    ├── tk-organizations/
    └── tk-community/
```

## Phase 1: Theme Foundation

### 1.1 Theme Setup
- Create theme directory structure
- Set up `style.css` with theme header metadata
- Create `functions.php` with core theme setup
- Enqueue styles and scripts (Material-UI equivalent CSS, custom styles)
- Register navigation menus, widget areas
- Add theme support (post thumbnails, custom logo, etc.)

### 1.2 Convert Design System
- **Color Palette**: Convert `@/theme.js` MUI theme to CSS custom properties
- **Typography**: Implement Google Fonts (Playfair Display, DM Sans, DM Mono)
- **Components**: Create reusable CSS classes matching MUI components
- **Responsive Design**: Maintain breakpoints from MUI theme

### 1.3 Core Templates
- `header.php`: Convert `@/components/Navbar.js` to WordPress navigation
- `footer.php`: Convert `@/components/Footer.js` with dynamic widgets
- `index.php`: Default blog template
- `front-page.php`: Home page template (from `@/pages/index.js`)
- `page.php`: Default page template
- `single.php`: Single post template

## Phase 2: Custom Post Types & Taxonomies

### 2.1 Climate Alerts CPT
**Plugin**: `tk-climate-alerts`
- Post type: `tk_alert`
- Meta fields:
  - Alert level (RED, ORANGE, YELLOW, GREEN)
  - Affected area
  - Issue date, valid until
  - Source organization
  - Actions (repeater)
  - Icon/emoji
- Taxonomies: `alert_category`, `alert_region`
- Custom admin columns and filters
- REST API endpoints for frontend queries

### 2.2 Reports CPT
**Plugin**: `tk-reports`
- Post type: `tk_report`
- Meta fields:
  - Report type (Climate, Livestock, Food Security, etc.)
  - Publication date
  - Organization
  - PDF attachment
  - Key findings (repeater)
- Taxonomies: `report_type`, `report_year`

### 2.3 Organizations CPT
**Plugin**: `tk-organizations`
- Post type: `tk_organization`
- Meta fields:
  - Organization type (Government, NGO, UN, etc.)
  - Contact information
  - Website URL
  - Logo
  - Focus areas (multi-select)
  - Active projects
- Custom taxonomy: `org_type`, `org_region`

### 2.4 Community Posts CPT
**Plugin**: `tk-community`
- Post type: `tk_community_post`
- Meta fields:
  - Author name, role, location
  - Post type (Story, Advisory, Question)
  - Featured status
  - Engagement metrics
- Frontend submission form
- Moderation workflow

## Phase 3: Page Templates

### 3.1 Home Page (`front-page.php`)
Convert `@/pages/index.js` sections:
- Hero section with live metrics
- Forecast strip (dynamic data)
- Climate hub section
- Map section (React component shortcode)
- Warnings strip (query latest alerts)
- Initiatives section
- Community section (query latest posts)
- Organizations section (query featured orgs)
- News section

### 3.2 Early Warnings Page (`page-early-warnings.php`)
Convert `@/pages/early-warnings.js`:
- Page hero with stats
- Alert cards (query `tk_alert` CPT)
- Filter by level, region
- Download functionality
- Archive/past alerts

### 3.3 Community Page (`page-community.php`)
Convert `@/pages/community.js`:
- Community stories grid
- Filter by type, region
- Submission form
- Featured stories

### 3.4 Reports Page (`page-reports.php`)
Convert `@/pages/reports.js`:
- Reports library
- Filter by type, year, organization
- Download PDFs
- Report cards with metadata

### 3.5 Organizations Page (`page-organizations.php`)
Convert `@/pages/organizations.js`:
- Organizations directory
- Filter by type, region
- Organization cards with details
- Contact information

### 3.6 Submit Advisory Page (`page-submit.php`)
Convert `@/pages/submit.js`:
- Frontend submission form
- File uploads
- Form validation
- Success/error handling
- Email notifications to admins

## Phase 4: React Component Integration

### 4.1 Regional Map Plugin
**Plugin**: `tk-regional-map`
- Bundle React app with Webpack/Vite
- Leaflet map component from `@/components/RegionalMap.js`
- Create shortcode: `[tk_regional_map]`
- Pass data via REST API or localized script
- Location markers with popups
- Alert circles
- Weather stations
- Layer controls

### 4.2 Build Process
- Set up build pipeline for React components
- Webpack/Vite configuration
- Bundle React, ReactDOM, Leaflet
- Output to plugin assets directory
- Enqueue scripts properly in WordPress

### 4.3 Data Integration
- REST API endpoints for map data
- Location data from custom fields
- Real-time alert data
- Weather station data
- Caching strategy

## Phase 5: Custom Functionality

### 5.1 Theme Functions (`inc/` directory)
- `custom-post-types.php`: Register CPTs
- `taxonomies.php`: Register taxonomies
- `meta-boxes.php`: Custom meta boxes
- `admin-customization.php`: Admin UI enhancements
- `rest-api.php`: Custom REST endpoints
- `shortcodes.php`: Theme shortcodes
- `widgets.php`: Custom widgets
- `helpers.php`: Utility functions

### 5.2 Admin Customization
- Custom dashboard widgets (live stats)
- Alert management interface
- Bulk actions for alerts
- Custom admin menu structure
- Role capabilities (Alert Manager, Report Editor, etc.)
- Admin notices for urgent alerts

### 5.3 Frontend Features
- AJAX filtering for alerts, reports
- Search functionality
- Breadcrumbs
- Social sharing
- Print-friendly views
- Accessibility (WCAG 2.1 AA)

## Phase 6: Data & Content Migration

### 6.1 Sample Data
- Create sample alerts (various levels)
- Sample reports with PDFs
- Sample organizations
- Sample community posts
- Weather station data
- Location data for map

### 6.2 Import Scripts
- CSV import for organizations
- JSON import for locations
- Bulk alert creation
- Media library organization

## Phase 7: Styling & Assets

### 7.1 CSS Architecture
- Convert MUI styles to custom CSS
- Use CSS Grid and Flexbox
- Maintain responsive design
- Dark mode support (hero section)
- Print styles
- Animation/transitions

### 7.2 JavaScript
- Vanilla JS for interactions
- AJAX for dynamic content
- Form validation
- Mobile menu functionality
- Smooth scrolling
- Loading states

### 7.3 Assets
- Optimize images
- Icon system (Material Icons or similar)
- Favicon and app icons
- Social media images

## Phase 8: Performance & Optimization

### 8.1 Performance
- Lazy loading images
- Minify CSS/JS
- Caching strategy (transients for queries)
- CDN for assets
- Database query optimization
- Conditional script loading

### 8.2 SEO
- Yoast SEO compatibility
- Schema markup (Organization, Event, Article)
- Open Graph tags
- XML sitemap
- Breadcrumb schema

### 8.3 Security
- Sanitize inputs
- Escape outputs
- Nonce verification
- Capability checks
- SQL injection prevention
- XSS protection

## Phase 9: Testing & Documentation

### 9.1 Testing
- Cross-browser testing
- Mobile responsiveness
- Form submissions
- Alert filtering
- Map functionality
- Admin workflows
- Performance testing

### 9.2 Documentation
- Theme documentation
- Plugin documentation
- Admin user guide
- Developer documentation
- Shortcode reference
- REST API documentation

## Phase 10: Deployment & Maintenance

### 10.1 Deployment
- WordPress installation
- Theme activation
- Plugin activation
- Import sample data
- Configure settings
- Set up cron jobs (if needed)

### 10.2 Maintenance Plan
- Update schedule
- Backup strategy
- Monitoring setup
- Support documentation

## Technical Requirements

### WordPress
- WordPress 6.0+
- PHP 8.0+
- MySQL 5.7+ or MariaDB 10.3+

### Dependencies
- React 18+ (for map components)
- Leaflet.js
- Material Icons or equivalent
- Google Fonts

### Recommended Plugins
- Classic Editor or Gutenberg (based on preference)
- WP Mail SMTP (for notifications)
- Wordfence Security
- WP Super Cache or similar
- Redirection (for URL management)

## Key Considerations

1. **Maintain Design Fidelity**: Preserve the modern, professional design from Next.js version
2. **Performance**: Optimize for fast loading despite rich content
3. **Accessibility**: Ensure WCAG compliance for all users
4. **Mobile-First**: Prioritize mobile experience for field users
5. **Scalability**: Design for growth in content and users
6. **Multilingual Ready**: Structure for potential translation (WPML/Polylang)
7. **API-First**: Build REST endpoints for potential mobile app
8. **Offline Capability**: Consider PWA features for offline access

## Deliverables

1. Complete WordPress theme (`turkana-karamoja`)
2. Five custom plugins (alerts, map, reports, organizations, community)
3. Sample content and data
4. Documentation (admin guide, developer docs)
5. Installation guide
6. Testing report

## Estimated Timeline

- **Phase 1-2**: 1-2 weeks (Foundation & CPTs)
- **Phase 3**: 2-3 weeks (Page templates)
- **Phase 4**: 1-2 weeks (React integration)
- **Phase 5-6**: 1-2 weeks (Functionality & data)
- **Phase 7-8**: 1 week (Styling & optimization)
- **Phase 9-10**: 1 week (Testing & deployment)

**Total**: 7-11 weeks for full implementation

## Success Metrics

- All pages functional and matching design
- Admin can manage all content types
- Map displays correctly with real-time data
- Forms submit successfully
- Performance: < 3s page load
- Accessibility: WCAG 2.1 AA compliance
- Mobile responsive on all devices
- SEO optimized
