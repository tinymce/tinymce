import { exec, execSync } from 'child_process';
import { setTimeout } from 'timers';

let devServer;
let exitCode = 0;

const cleanUp = () => {
  if (devServer) {
    devServer.kill();
  }
  process.exit(exitCode);
};

process.on('SIGINT', cleanUp);
process.on('SIGTERM', cleanUp);

const waitForServer = async () => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 5000);
  });
};

const runTests = async () => {
  try {
    devServer = exec('yarn start --ci' );
    await waitForServer();
    execSync('yarn playwright test', {
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('Running tests failed:', error);
    exitCode = 1;
  } finally {
    cleanUp();
  }
}

await runTests();
