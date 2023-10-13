import { esbuildPlugin } from '@web/dev-server-esbuild';
import { fromRollup } from '@web/dev-server-rollup';
import { playwrightLauncher } from '@web/test-runner-playwright';
import { typescriptPaths } from 'rollup-plugin-typescript-paths';

const typescriptPaths2 = fromRollup(typescriptPaths);

export default {
  nodeResolve: true,
  // files: ['modules/tinymce/src/themes/silver/test/**/*Test.ts'],
  files: ['modules/tinymce/src/themes/silver/test/**/ContextMenuTriggerTest.ts'],
  plugins: [
    typescriptPaths2({ preserveExtensions: true }),
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
