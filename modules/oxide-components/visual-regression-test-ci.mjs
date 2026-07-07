import { spawnSync } from 'child_process';

let exitCode = 0;

const cleanUp = () => {
  process.exit(exitCode);
};

process.on('SIGINT', cleanUp);
process.on('SIGTERM', cleanUp);

const runTests = async () => {
  try {
    const args = [
      'run',
      '--project', 'visual',
      '--reporter=default',
      '--reporter=junit',
      '--outputFile=scratch/test-results-visual.xml'
    ];
    const workers = Number(process.env.PW_WORKERS);
    if (Number.isInteger(workers) && workers > 0) {
      args.push(`--maxWorkers=${workers}`);
    }

    const result = spawnSync('vitest', args, { stdio: 'inherit' });
    if (result.error) {
      console.error('Failed to run Vitest', result.error);
      exitCode = 1;
      return;
    }

    const code = result.status ?? 1;
    if (code === 1) {
      exitCode = 4;
    } else {
      exitCode = code;
    }
  } catch (error) {
    console.error('Script error:', error);
    exitCode = 1;
  } finally {
    cleanUp();
  }
};

await runTests();
