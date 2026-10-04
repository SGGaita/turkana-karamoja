import { APP_NAME } from '../branding';

export const helpNav = [
  {
    slug: 'hub',
    label: 'Help Center',
    href: '/help',
    description: 'Documentation hub — start here',
    icon: 'home',
  },
  {
    slug: 'faq',
    label: 'FAQ',
    href: '/help/faq',
    description: 'Frequently asked questions for end users',
    icon: 'question',
  },
  {
    slug: 'user-guide',
    label: 'Frontend User Guide',
    href: '/help/user-guide',
    description: `How to use the public ${APP_NAME} website`,
    icon: 'public',
  },
  {
    slug: 'admin-guide',
    label: 'Backend & Admin Guide',
    href: '/help/admin-guide',
    description: 'WordPress CMS and partner portal administration',
    icon: 'admin',
  },
  {
    slug: 'technical',
    label: 'Technical Documentation',
    href: '/help/technical',
    description: 'Architecture, APIs, deployment, and development',
    icon: 'code',
  },
];

export function getNavItem(slug) {
  return helpNav.find((item) => item.slug === slug);
}
