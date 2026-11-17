import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createRequire } from 'node:module';

/**
 * Accessibility (axe, the engine behind Lighthouse's accessibility score) on every page: WCAG 2.2 A/AA rules, failing
 * on serious and critical problems — text too faint for its background, buttons and links without a name, form
 * fields without a label, controls too small to tap. Measured against each element's real background, so it also
 * covers text on dark panels.
 */
const { STATIC_ROUTES } = createRequire(import.meta.url)('../../lib/offline-config.js');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** One line per problem: the rule, how many places, and the first few of them. */
function describe(violations) {
  return violations.map((v) => {
    const where = v.nodes.slice(0, 4).map((n) => `${n.target.join(' ')}${n.any?.[0]?.message ? ` (${n.any[0].message.split('. ')[0]})` : ''}`);
    return `${v.id} [${v.impact}] ×${v.nodes.length}: ${v.help}\n    ${where.join('\n    ')}`;
  });
}

test.describe('accessibility', () => {
  for (const path of [...STATIC_ROUTES, '/sw']) {
    test(`${path}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'once is enough (the same page on phones)');
      await page.goto(path, { waitUntil: 'load' });
      await page.waitForTimeout(800); // late content (maps, lists)
      const { violations: all } = await new AxeBuilder({ page })
        .withTags(TAGS)
        // Map pictures are drawn by the map library and have no text of their own.
        .exclude('.leaflet-tile-pane')
        .disableRules(['target-size'])
        .analyze();
      // Tap size: every control except the map's dots, which are 24 px but can overlap where two places are close
      // at the starting zoom (visitors zoom in); their names are still checked above.
      const { violations: taps } = await new AxeBuilder({ page })
        .withRules(['target-size'])
        .exclude('.leaflet-marker-pane')
        .analyze();
      const violations = [...all, ...taps];
      const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      const minor = violations.filter((v) => !serious.includes(v));
      if (minor.length) testInfo.annotations.push({ type: 'minor', description: describe(minor).join('\n') });
      expect(describe(serious), `${path}: accessibility problems`).toEqual([]);
    });
  }
});
