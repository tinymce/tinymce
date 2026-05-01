import { spawn, spawnSync } from 'child_process';
import path from 'path';
import { createRequire } from 'module';

const pwd = process.cwd();

// Resolve playwright to find the real project root, even when tinymce is
// nested inside a monorepo with a shared node_modules.
// Resolving package.json gives a fixed-depth anchor: from there it's always
// package-root → node_modules → project-root (2 levels up).
const require = createRequire(import.meta.url);
const playwrightPkg = require.resolve('@playwright/test/package.json');
console.log(`Playwright test package.json: ${playwrightPkg}`);
const projectRoot = path.resolve(playwrightPkg, '../../../..');
const relativeToRoot = path.relative(projectRoot, pwd);

console.log(`Project root: ${projectRoot}`);
console.log(`Relative to project root: ${relativeToRoot}`);

// This script is used to run visual regression tests in a Docker container.

const devServer = spawn('bun', ['start', '--ci'], {
  stdio: 'inherit'
});

const buildResult = spawnSync('docker', ['build', '-t', 'oxide-components-test-visual', '.', '-f', 'Dockerfile.playwright-test'],
  { stdio: 'inherit' }
);

if (buildResult.error ?? (buildResult.status ?? 1) !== 0) {
  devServer.kill();
  throw buildResult.error ?? new Error(`Failed to build Docker image, return code ${(buildResult.status ?? 1)}`);
}


const dockerArgs = [
  'run',
  '--rm',
  '--name=oxide-components-test-visual',
  '--userns=host',
  '--add-host=host.docker.internal:host-gateway',
  '-e', "TEST_BASE_URL=http://host.docker.internal:6006",
  '-v', `${projectRoot}:/tinymce`,
  '-v', `${pwd}/src/test/ts/visual.spec.ts-snapshots:/tinymce/${relativeToRoot}/src/test/ts/visual.spec.ts-snapshots`,
  'oxide-components-test-visual'
];

if (process.argv[2] === 'update') {
  dockerArgs.push('--update-snapshots');
}

const docker = spawn('docker', dockerArgs, {
  stdio: 'inherit'
});

docker.on('exit', (code) => {
  devServer.kill();
  process.exit(code ?? 0);
});

process.on('SIGINT', () => {
  docker.kill();
  process.exit();
});
