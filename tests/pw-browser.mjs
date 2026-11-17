import { existsSync } from 'node:fs';
import { chromium } from '@playwright/test';

/**
 * Which browser the Playwright checks use: PW_CHROME_PATH (a Chrome executable), else PW_CHANNEL ('chrome' /
 * 'msedge'), else Playwright's own Chromium if it has been downloaded (`npx playwright install chromium`), else the
 * installed Google Chrome. Returns Playwright `use` options.
 */
export function browserUse() {
  if (process.env.PW_CHROME_PATH) return { launchOptions: { executablePath: process.env.PW_CHROME_PATH } };
  if (process.env.PW_CHANNEL) return { channel: process.env.PW_CHANNEL };
  return existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' };
}
