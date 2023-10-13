import { esbuildPlugin } from '@web/dev-server-esbuild';
import { fromRollup } from '@web/dev-server-rollup';
import { playwrightLauncher } from '@web/test-runner-playwright';
import tsConfigPaths from 'rollup-plugin-tsconfig-paths';

const tsPaths = fromRollup(tsConfigPaths);

export default {
  nodeResolve: true,
  // files: ['modules/tinymce/src/themes/silver/test/**/*Test.ts'],
  files: ['modules/tinymce/src/themes/silver/test/**/ContextMenuTriggerTest.ts'],
  plugins: [
    tsPaths({}),
    esbuildPlugin({ ts: true })
  ],
  playwright: true,
  // coverage: true,
  browsers: [
    // playwrightLauncher({ product: 'webkit' }),
    playwrightLauncher({ product: 'chromium' }),
    // playwrightLauncher({ product: 'firefox' })
  ],
};
