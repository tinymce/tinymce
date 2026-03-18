import { defineConfig, devices } from '@playwright/test';

// We need to make the base URL configurable so we can
// change it when running tests in a Docker container.
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:6006';

export default defineConfig({
  // ...
  // Using the `html` reporter for visual diffing.
  reporter: process.env.CI ? [[ 'junit', { outputFile: 'scratch/test-results-visual.xml' }], [ 'html', { open: 'never' }]] : 'list',
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
  // We can't run development storybook in Docker, because rollup uses native binaries
  webServer: process.env.CI
    ? {
      command: 'yarn start --ci --loglevel debug',
      stdout: 'pipe',
      url: BASE_URL,
      reuseExistingServer: true,
    }
    : undefined,
});
