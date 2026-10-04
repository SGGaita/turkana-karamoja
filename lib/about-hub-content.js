import { APP_NAME, APP_TAGLINE, APP_FULL_NAME } from './branding';
import { platformCoverageIntro } from './regions';

export const ABOUT_HUB_IMAGE =
  'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80';

export const aboutHubIntro = {
  eyebrow: `About ${APP_NAME}`,
  titleLine1: APP_NAME,
  titleLine2: APP_TAGLINE,
  description:
    `${platformCoverageIntro(APP_FULL_NAME)} Spanning the border communities of Kenya and Uganda, the platform draws on national meteorological and government data sources to deliver clear, actionable climate intelligence to communities, county and national government directorates, and partner organizations — supporting better adaptation, resilience, and peaceful coexistence across the region.`,
};

export const aboutHubHighlights = [
  {
    title: 'Commissioned by',
    desc: 'Danish Refugee Council — Karamoja Strong Project (KSP)',
  },
  {
    title: 'Early Warning Systems',
    desc: 'Climate and hazard alerts to support community preparedness and cascade early warning information across the region.',
  },
  {
    title: 'Adaptation Strategies & Best Practices',
    desc: 'Climate-smart agriculture, pastoralist mobility, and community-based natural resource management guides — supporting sustainable livelihoods and reducing resource-driven conflict.',
  },
];

export const commissionedByContent = {
  title: 'Commissioned By',
  organization: 'Danish Refugee Council (DRC)',
  project: 'Karamoja Strong (KSP)',
  description:
    'Danish Refugee Council — Karamoja Strong Project (KSP). Supporting climate-resilient communities across the Karamoja Cluster through early warning systems, adaptation guidance, and cross-border coordination.',
};
