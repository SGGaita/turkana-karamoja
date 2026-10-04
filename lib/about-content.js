const DEFAULT_FEATURES = [
  {
    title: 'Early Warning Systems',
    description:
      'Real-time flood, drought, locust, and disease outbreak alerts covering all sub-counties in Turkana and Karamoja.',
  },
  {
    title: 'Climate Information',
    description:
      'Seasonal forecasts, weather advisories, and climate outlooks from verified meteorological agencies.',
  },
  {
    title: 'Community Services',
    description:
      'Water point status, pasture conditions, livestock health, and humanitarian assistance information.',
  },
  {
    title: 'Multi-Channel Access',
    description:
      'Web platform, SMS alerts, community radio broadcasts, and toll-free hotline for universal access.',
  },
  {
    title: 'Cross-Border Coordination',
    description:
      'Joint Kenya-Uganda platform enabling coordinated response to climate risks across borders.',
  },
  {
    title: 'Verified Information',
    description:
      'All advisories published by authorized government agencies, UN bodies, and verified partners only.',
  },
];

const DEFAULT_STEPS = [
  {
    step: 1,
    title: 'Data Collection',
    description:
      'Meteorological agencies, government departments, and humanitarian organizations collect climate, weather, and humanitarian data.',
  },
  {
    step: 2,
    title: 'Verification & Publishing',
    description:
      'Only verified organizations can publish advisories through the platform. All content is reviewed before publication.',
  },
  {
    step: 3,
    title: 'Multi-Channel Dissemination',
    description:
      'Information is distributed via web platform, SMS alerts, community radio broadcasts, and toll-free hotline.',
  },
  {
    step: 4,
    title: 'Community Action',
    description:
      'Pastoral and agropastoral communities receive timely warnings and guidance to protect lives, livestock, and livelihoods.',
  },
];

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseListItems(html, headingPattern, listTag) {
  if (!html) return null;

  const match = html.match(
    new RegExp(`<h2[^>]*>\\s*${headingPattern}\\s*<\\/h2>\\s*<${listTag}>([\\s\\S]*?)<\\/${listTag}>`, 'i'),
  );
  if (!match) return null;

  const items = [...match[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
  if (!items.length) return null;

  return items.map((item, index) => {
    const raw = item[1];
    const strong = raw.match(/<strong[^>]*>([^<]*)<\/strong>/i);
    const title = strong ? stripTags(strong[1]) : `Item ${index + 1}`;
    const description = stripTags(
      raw.replace(/<strong[^>]*>[^<]*<\/strong>\s*[—–-]\s*/i, ''),
    );

    return { title, description };
  });
}

export function parseKeyFeatures(html) {
  const items = parseListItems(html, 'Key Features[^<]*', 'ul');
  return items || DEFAULT_FEATURES;
}

export function parseHowItWorksSteps(html) {
  const items = parseListItems(html, 'How the Hub Works', 'ol');
  if (!items) return DEFAULT_STEPS;

  return items.map((item, index) => ({
    step: index + 1,
    ...item,
  }));
}

export function parseCommissionedBy(html) {
  if (!html) return null;

  const match = html.match(/<h2[^>]*>\s*Commissioned By\s*<\/h2>([\s\S]*?)(?=<h2|$)/i);
  if (!match) return null;

  const body = match[1];
  const paragraphs = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => stripTags(m[1])).filter(Boolean);
  const description = paragraphs.join(' ') || '';

  const orgMatch = description.match(/Danish Refugee Council \(DRC\)/i);
  const projectMatch = description.match(/Karamoja Strong \(KSP\)[^.]*/i);

  return {
    title: 'Commissioned By',
    organization: orgMatch ? 'Danish Refugee Council (DRC)' : 'Danish Refugee Council (DRC)',
    project: projectMatch ? projectMatch[0].replace(/\.$/, '') : 'Karamoja Strong (KSP) project',
    description,
    logoUrl: '/images/drc-logo.svg',
    logoAlt: 'Danish Refugee Council logo',
  };
}

export function splitIntroSections(intro) {
  if (!intro) {
    return { mission: '', geographic: '' };
  }

  const geoRegex = /<h2[^>]*>\s*Geographic Coverage\s*<\/h2>[\s\S]*/i;
  const idx = intro.search(geoRegex);
  if (idx === -1) {
    return { mission: intro, geographic: '' };
  }

  return {
    mission: intro.slice(0, idx).trim(),
    geographic: intro.slice(idx).trim(),
  };
}

const COMMISSIONED_REGEX = /<h2[^>]*>\s*Commissioned By\s*<\/h2>[\s\S]*?(?=<h2|$)/i;

function stripSection(html, regex) {
  return html.replace(regex, '').trim();
}

export function splitAboutContent(html) {
  if (!html) {
    return { intro: '', outro: '', hasFeatures: false, hasStepper: false, hasCommissioned: false };
  }

  const featuresRegex = /<h2[^>]*>\s*Key Features[^<]*<\/h2>\s*<ul>[\s\S]*?<\/ul>/i;
  const stepperRegex = /<h2[^>]*>\s*How the Hub Works\s*<\/h2>\s*<ol>[\s\S]*?<\/ol>/i;

  let intro = html;
  let middle = '';
  let outro = '';
  let hasFeatures = false;
  let hasStepper = false;

  const featuresMatch = html.match(featuresRegex);
  if (featuresMatch) {
    hasFeatures = true;
    const idx = html.search(featuresRegex);
    intro = html.slice(0, idx);
    middle = html.slice(idx + featuresMatch[0].length);
  }

  const stepperSource = hasFeatures ? middle : html;
  const stepperMatch = stepperSource.match(stepperRegex);
  if (stepperMatch) {
    hasStepper = true;
    const idx = stepperSource.search(stepperRegex);
    if (!hasFeatures) {
      intro = stepperSource.slice(0, idx);
    }
    outro = stepperSource.slice(idx + stepperMatch[0].length);
  } else if (hasFeatures) {
    outro = middle;
  }

  const hasCommissioned = COMMISSIONED_REGEX.test(html);
  intro = stripSection(intro, COMMISSIONED_REGEX);
  outro = stripSection(outro, COMMISSIONED_REGEX);

  return { intro, outro, hasFeatures, hasStepper, hasCommissioned };
}

export { DEFAULT_FEATURES, DEFAULT_STEPS };
