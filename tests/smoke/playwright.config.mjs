import { defineConfig, devices } from '@playwright/test';
import { smokeEnv } from './env.mjs';

/**
 * Smoke checks after a deployment or cut-over (FE-28). Read-only: they never submit a form or change content.
 *
 *   npm run test:smoke                                  website http://localhost:3000, CMS from .env.local
 *   SMOKE_SITE=https://www.example.org SMOKE_CMS=https://cms.example.org npm run test:smoke
 *
 * Settings and what each check covers: tests/smoke/README.md.
 */
const env = smokeEnv();

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.mjs$/,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  workers: 2,
  retries: env.ci ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: '../../playwright-report/smoke', open: 'never' }]],
  outputDir: '../../test-results/smoke',
  use: {
    baseURL: env.site,
    serviceWorkers: 'allow',
    ...devices['Desktop Chrome'],
    ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}),
    ...(process.env.PW_CHROME_PATH ? { launchOptions: { executablePath: process.env.PW_CHROME_PATH } } : {}),
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // Phones: only the page checks (layout, no sideways scrolling); the CMS checks need running once.
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /website\.spec\.mjs$/, grep: /@pages/ },
  ],
});
