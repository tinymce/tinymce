import { spawn, spawnSync } from 'child_process';

// This script is used to run visual regression tests in a Docker container.

const devServer = spawn('yarn', ['start', '--ci'], {
  stdio: 'inherit'
});

spawnSync('docker', ['build', '-t', 'oxide-components-test-visual', '.', '-f', 'Dockerfile.playwright-test'],
  { stdio: 'inherit' }
);

const pwd = process.cwd();
const parentDir = pwd + '/../../';

const dockerArgs = [
  'run',
  '--rm',
  '--name=oxide-components-test-visual',
  '--userns=host',
  '-e', "TEST_BASE_URL=http://host.docker.internal:6006",
  '-e', 'CI=true',
  '-v', `${parentDir}:/tinymce`,
  '-v', `${pwd}/src/test/ts/visual.spec.ts-snapshots:/tinymce/modules/oxide-components/src/test/ts/visual.spec.ts-snapshots`,
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
