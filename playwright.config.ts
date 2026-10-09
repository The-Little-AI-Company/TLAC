import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 4400);

// End-to-end tests drive the built site through `astro preview`, so run
// `pnpm build` first. They never download a browser: Chromium comes from
// PLAYWRIGHT_BROWSERS_PATH.
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0, // a flaky test is a bug in the test
  reporter: 'list',
  outputDir: 'test-results',
  expect: { timeout: 5_000 },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    // A static page answers at once. A locator that finds nothing after 3 seconds never will.
    actionTimeout: 3_000,
    navigationTimeout: 15_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm exec astro preview --host 127.0.0.1 --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
