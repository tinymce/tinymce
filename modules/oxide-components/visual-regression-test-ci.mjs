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
    devServer = exec('yarn start --ci');
    await waitForServer();

    try {
      execSync('yarn playwright test', {
        stdio: 'inherit'
      });
    } catch (testError) {
      // Check the exit code to differentiate between test failures and actual errors
      const testExitCode = testError.status;

      // Exit code 1 typically means test failures (not script errors)
      // Set exitCode = 4 for test failures - let CI continue
      if (testExitCode === 1) {
        exitCode = 4;
      } else {
        // Other exit codes indicate actual errors (missing config, setup issues, etc.)
        console.error('Playwright encountered an error:', testError);
        exitCode = 1;
      }
    }
  } catch (error) {
    // This catches server startup errors or other script-level issues
    console.error('Script error (server startup, etc.):', error);
    exitCode = 1;
  } finally {
    cleanUp();
  }
}

await runTests();
