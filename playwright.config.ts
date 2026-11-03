import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests against the production build (`vite preview`), so the
 * service worker and PWA behaviour are the ones users get.
 *
 *   npm run test:e2e            # all browsers
 *   npm run test:e2e -- --project=chromium
 *
 * First run only: `npx playwright install chromium firefox webkit`.
 * Edge runs from its installed stable channel (`npx playwright install msedge`,
 * which needs sudo); locally the project is left out where Edge isn't installed.
 */
const PORT = 4173;

const EDGE_PATHS = [
  '/Applications/Microsoft Edge.app',
  '/opt/microsoft/msedge/msedge',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];
// Always on in CI, so a broken Edge install fails the run instead of skipping it.
const hasEdge = !!process.env.CI || EDGE_PATHS.some((path) => existsSync(path));

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // The app turns off smooth scrolling and animation under reduced motion,
    // which keeps elements still while Playwright scrolls to them. It must go
    // through contextOptions: as a top-level `use` option it is silently
    // ignored, and a smooth scroll still moving under a tap cancels the click.
    contextOptions: { reducedMotion: 'reduce' },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } } },
    ...(hasEdge
      ? [{ name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge', viewport: { width: 1440, height: 900 } } }]
      : []),
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    // Mobile Safari at 375px, for the responsive navigation flow.
    { name: 'mobile-safari', use: { ...devices['iPhone 13 Mini'] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
        port: PORT,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
