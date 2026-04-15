import { spawnSync } from 'child_process';

let exitCode = 0;

const cleanUp = () => {
  process.exit(exitCode);
};

process.on('SIGINT', cleanUp);
process.on('SIGTERM', cleanUp);

const runTests = async () => {
  try {
    const args = ['playwright', 'test'];
    const workers = Number(process.env.PW_WORKERS);
    if (Number.isInteger(workers) && workers > 0) {
      args.push(`--workers=${workers}`);
    }
    const result = spawnSync('npx', [ '--no', ...args ], { stdio: 'inherit' });
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
