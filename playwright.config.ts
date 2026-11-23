import { defineConfig, devices } from '@playwright/test';

// Uses a system Chrome when CHROME_PATH is set (CI images and sandboxes
// without Playwright's browser downloads); otherwise Playwright's Chromium.
const executablePath = process.env.CHROME_PATH || undefined;
const chromium = { ...devices['Desktop Chrome'], launchOptions: { executablePath } };

export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: { baseURL: 'http://localhost:4321', trace: 'retain-on-failure' },
  webServer: { command: 'npm run preview', url: 'http://localhost:4321', reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: 'desktop', use: { ...chromium, viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], launchOptions: { executablePath } } },
    ...(process.env.WEBKIT ? [{ name: 'webkit', use: { ...devices['iPhone 14'] } }] : []),
  ],
});
