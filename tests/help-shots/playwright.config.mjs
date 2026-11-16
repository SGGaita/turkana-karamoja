import { defineConfig } from '@playwright/test';

/** Help screenshots (WP-44): `npm run help:shots`. See README.md in this folder. */
export default defineConfig({
  testDir: '.',
  testMatch: /capture\.spec\.mjs$/,
  timeout: 120_000,
  workers: 1,
  reporter: [['list']],
  outputDir: '../../test-results/help-shots',
  use: {
    ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}),
    ...(process.env.PW_CHROME_PATH ? { launchOptions: { executablePath: process.env.PW_CHROME_PATH } } : {}),
  },
});
