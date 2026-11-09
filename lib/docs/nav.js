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
    label: 'User Guide',
    href: '/help/user-guide',
    description: `How to use the public ${APP_NAME} website`,
    icon: 'public',
  },
];

export function getNavItem(slug) {
  return helpNav.find((item) => item.slug === slug);
}
