import { defineConfig, devices } from '@playwright/test';

/**
 * Browser smoke tests against the production build (`vite preview`).
 *
 * Run with `npm run test:e2e`, which builds first. The first time on a new
 * machine, install the browser once: `npx playwright install chromium`.
 *
 * Uses 127.0.0.1 rather than localhost so Windows/Node never picks an IPv6
 * address the preview server isn't listening on.
 */
const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 60_000,
  },
});
