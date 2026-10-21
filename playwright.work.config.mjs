import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests', testMatch: 'work-deletion-browser.spec.mjs',
  use: { baseURL: 'http://127.0.0.1:4177', headless: true, launchOptions: process.env.PLAYWRIGHT_CHROME ? { channel: 'chrome' } : {} },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4177 --strictPort', url: 'http://127.0.0.1:4177', reuseExistingServer: false }, reporter: 'list',
});
