import { defineConfig, devices } from '@playwright/test';
import { browserUse } from '../pw-browser.mjs';

/**
 * Offline check (FE-09): against a production build with its service worker (`npm run build && npm start`).
 *   npm run test:offline                     http://localhost:3000
 *   OFFLINE_URL=https://… npm run test:offline
 */
export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.mjs$/,
  timeout: 240_000,
  workers: 1,
  reporter: [['list']],
  outputDir: '../../test-results/offline',
  use: {
    baseURL: process.env.OFFLINE_URL || 'http://localhost:3000',
    serviceWorkers: 'allow',
    ...devices['Pixel 7'],
    ...browserUse(),
  },
});
