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
          server: {
            deps: {
              // @ephox/dispute ships "type": "module" with extensionless relative imports,
              // which Node's strict ESM loader rejects. Inlining routes @ephox packages
              // through Vite's resolver, which tolerates the missing extension. The whole
              // chain (sugar → katamari → dispute) must be inlined: if a parent stays
              // externalized, Node loads it directly and its `import '@ephox/dispute'`
              // never reaches Vite.
              inline: [ '@ephox' ]
            }
          },
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
          include: [ 'react/jsx-dev-runtime' ],
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
