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
  // We can't run development storybook in Docker, because rollup uses native binaries.
  // But we can in CI where we don't need Docker.
  webServer: process.env.CI
    ? {
      command: 'npm start -- --ci --loglevel debug',
      stdout: 'pipe',
      url: BASE_URL,
      reuseExistingServer: true,
    }
    : undefined,
});
