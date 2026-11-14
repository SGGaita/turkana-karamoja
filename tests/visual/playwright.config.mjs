import { defineConfig, devices } from '@playwright/test';

/**
 * Visual check (FE-03 / FE-25): the same pages, desktop and mobile, compared with the "before" pictures taken from
 * the frozen sandbox. Run through `npm run test:visual` / `npm run test:visual:baseline` (tests/visual/run.mjs).
 */
const baseURL = process.env.VISUAL_URL || 'http://localhost:3000';
// Browser: PW_CHROME_PATH (a chrome executable), or PW_CHANNEL ('chrome' / 'msedge': the one installed on this
// computer, no download), or Playwright's own Chromium. run.mjs picks one and records it with the pictures.
const launchOptions = process.env.PW_CHROME_PATH ? { executablePath: process.env.PW_CHROME_PATH } : {};
const channel = process.env.PW_CHROME_PATH ? undefined : process.env.PW_CHANNEL || undefined;

export default defineConfig({
  testDir: '.',
  testMatch: /\.spec\.mjs$/,
  outputDir: '../../test-results/visual',
  // One folder per viewport, no operating-system suffix: pictures taken on Windows compare on Windows or Linux.
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  timeout: 90_000,
  retries: 0,
  // Comparing: pages with no "before" picture (newer than the sandbox) are captured instead of failing.
  updateSnapshots: process.env.VISUAL_MODE === 'baseline' ? 'all' : 'missing',
  workers: 2,
  reporter: [['list'], ['html', { outputFolder: '../../playwright-report/visual', open: 'never' }]],
  expect: {
    toHaveScreenshot: {
      // The rebuilt site is meant to look the same, not be pixel-identical (real content replaced made-up content).
      // Small rendering noise passes; real layout changes fail and show up side by side in the HTML report.
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  use: {
    baseURL,
    serviceWorkers: 'block',
    launchOptions,
    ignoreHTTPSErrors: false,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, channel } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, browserName: 'chromium', channel } },
  ],
});
