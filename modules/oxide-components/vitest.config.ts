import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

import { mousedownCommand, mousemoveCommand, mouseupCommand } from './vitest-custom-commands';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'atomic',
          environment: 'node',
          alias: [
            {
              find: 'oxide-components',
              replacement: fileURLToPath(new URL('./src/main/ts/', import.meta.url))
            }
          ],
          include: [
            'src/test/ts/atomic/**/*.spec.ts'
          ]
        }
      },
      {
        optimizeDeps: {
          include: [ 'react/jsx-dev-runtime', 'react/jsx-runtime' ],
        },
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
            provider: playwright(),
            enabled: true,
            headless: true,
            screenshotFailures: false,
            instances: [
              { browser: 'chromium' }
            ],
            commands: { mousedownCommand, mouseupCommand, mousemoveCommand }
          }
        },
      },
    ]
  },
});
