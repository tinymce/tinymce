import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const packageDir = dirname(require.resolve('typescript7/package.json'));

// Both versions install `node_modules/.bin/tsc`, while module resolution locates the aliased package
// whether it is hoisted to the premium root or installed in a standalone tinymce checkout.
const { status } = spawnSync(process.execPath, [ join(packageDir, 'bin/tsc'), ...process.argv.slice(2) ], { stdio: 'inherit' });

process.exit(status ?? 1);
