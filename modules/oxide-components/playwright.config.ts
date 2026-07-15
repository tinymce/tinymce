import { defineConfig, devices, type ReporterDescription } from '@playwright/test';

// We need to make the base URL configurable so we can
// change it when running tests in a Docker container.
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:6006';

// Using the `html` reporter to record screenshots of visual diffs
const reporter: ReporterDescription[] = [[ 'html', { open: 'never' }]];
if (process.env.CI) {
  // In CI, use 'junit' for Jenkins results
  reporter.push([ 'junit', { outputFile: 'scratch/test-results-visual.xml' }]);
  // In CI, use 'list' because Jenkins has a strict time limit on how frequently log messages are written
  reporter.push([ 'list' ]);
}

export default defineConfig({
  // Ensure the build fails if an `only` test is checked in by accident
  forbidOnly: !!process.env.CI,
  // Explicit per-test timeout. Visual tests normally finish in a few seconds.
  timeout: 30_000,
  // Give screenshot comparison / visibility assertions a little more room.
  expect: { timeout: 10_000 },
  // Hard ceiling for the whole run. If a worker's event loop ever freezes (e.g. under
  // memory pressure in the CI container) its per-test timeout can't fire; the main process
  // enforces this and aborts with a reported failure well before the Jenkins stage timeout,
  // instead of stalling silently. See TINY-13766.
  globalTimeout: 15 * 60_000,
  // Ride out one-off visual flakes in CI without masking real regressions.
  retries: process.env.CI ? 1 : 0,
  // ...
  reporter,
  // ...
  // Exclude browser tests from being run by playwright
  testIgnore: [ '**/ts/browser/**', '**/ts/atomic/**' ],
  use: {
    baseURL: BASE_URL,
    // ...
  },
  // I recommend to run regression tests at
  // least for desktop and mobile devices.
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'desktop-firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'desktop-safari',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  // In CI we serve the pre-built static Storybook (produced by the Build stage's
  // `build-storybook`) with a tiny static file server, rather than running the full Vite
  // dev server. The dev server holds a large module graph in memory and, inside the 2Gi CI
  // container, pushed RSS over the cgroup limit once Firefox launched on top of it — freezing
  // the run with no output (TINY-13766). A static server has a negligible footprint and emits
  // no per-request logging, so it also removes the noisy piped output the dev server produced.
  // (Locally, `visual-regression-test.mjs` still serves the dev server on the host and runs
  // Playwright in Docker, so `webServer` is only configured for CI.)
  webServer: process.env.CI
    ? {
      command: 'npx --no http-server storybook-static -p 6006 -s',
      stdout: 'pipe',
      url: BASE_URL,
      reuseExistingServer: true,
    }
    : undefined,
});
