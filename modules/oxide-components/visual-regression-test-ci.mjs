import { spawn, spawnSync } from 'child_process';
import { setTimeout } from 'timers';

let devServer;
let exitCode = 0;

const cleanUp = () => {
  if (devServer) {
    devServer.kill('SIGTERM');
  }
  process.exit(exitCode);
};

process.on('SIGINT', cleanUp);
process.on('SIGTERM', cleanUp);

const waitForServer = async () => {
  await new Promise((resolve) => {
    // FIXME: Readiness check instead of blind wait
    setTimeout(() => {
      resolve();
    }, 5000);
  });
};

const runTests = async () => {
  try {
    devServer = spawn('yarn', ['start', '--ci'], { stdio: 'inherit' });
    // FIXME: Tag server in case it fails early for better error handling
    await waitForServer();

    const args = ['playwright', 'test'];
    const workers = Number(process.env.PW_WORKERS);
    if (Number.isInteger(workers) && workers > 0) {
      args.push(`--workers=${workers}`);
    }
    const result = spawnSync('yarn', args, { stdio: 'inherit' });
    if (result.error) {
      console.error('Failed to run Playwright', result.error);
      exitCode = 1;
      return;
    }
    const code = result.status ?? 1;
    if (code === 1) { // Test failures
      exitCode = 4;
    } else {
      exitCode = code;
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
