import { exec, execSync } from 'child_process';

// This script is used to run visual regression tests in a Docker container.

const devServer = exec('bun start --ci');

execSync(`docker build -t oxide-components-test-visual . -f Dockerfile.playwright-test`, {
  stdio: 'inherit'
});

const pwd = process.cwd();
const parentDir = pwd + '/../../';

execSync(`docker run --rm \
 --name=oxide-components-test-visual \
 --userns=host \
 -e TEST_BASE_URL='http://host.docker.internal:6006' \
 -e CI=true \
 -v ${parentDir}:/tinymce \
 -v ${pwd}/src/test/ts/visual.spec.ts-snapshots:/tinymce/modules/oxide-components/src/test/ts/visual.spec.ts-snapshots \
 oxide-components-test-visual ${process.argv[2] === 'update' ? '--update-snapshots' : ''}`, {
  stdio: 'inherit'
});

devServer.kill();
