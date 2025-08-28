/// <reference types="@vitest/browser/providers/playwright" />

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'browser',
          setupFiles: [ './vitest.setup.js' ],
          alias: [
            {
              find: 'oxide-components',
              replacement: fileURLToPath(new URL('./src/main/ts/', import.meta.url))
            }
          ],
          include: [
            'src/test/ts/browser/**/*.spec.{ts,tsx}'
          ],
          browser: {
            provider: 'playwright',
            enabled: true,
            headless: true,
            screenshotFailures: false,
            instances: [
              { browser: 'chromium' }
            ]
          }
        },
      },
      {
        extends: 'vite.config.ts',
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [
              {
                browser: 'chromium',
              },
              {
                browser: 'firefox',
              },
              {
                browser: 'webkit',
              },
            ],
          },
          setupFiles: [ '.storybook/vitest.setup.ts' ],
        },
      },
    ]
  },
});
