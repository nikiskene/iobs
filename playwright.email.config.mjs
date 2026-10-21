import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests",
  testMatch: "email-browser.spec.mjs",
  use: {
    baseURL: "http://127.0.0.1:4175",
    headless: true,
    launchOptions: process.env.PLAYWRIGHT_CHROME ? { channel: "chrome" } : {},
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4175 --strictPort",
    url: "http://127.0.0.1:4175",
    reuseExistingServer: false,
  },
  reporter: "list",
});
