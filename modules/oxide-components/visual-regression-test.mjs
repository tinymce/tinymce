import { spawn, spawnSync } from 'child_process';
import { createRequire } from 'module';
import path from 'path';

const CONTAINER_NAME = 'oxide-components-visual-browsers';
const BROWSER_SERVER_PORT = 3553;
const PW_WS_ENDPOINT = `ws://localhost:${BROWSER_SERVER_PORT}/`;

const pwd = process.cwd();
const require = createRequire(import.meta.url);
const playwrightPkg = require.resolve('playwright/package.json');
const playwrightPackage = require(playwrightPkg);
const playwrightPackageRoot = path.dirname(playwrightPkg);
const projectRoot = path.resolve(playwrightPackageRoot, '../..');
const relativePlaywrightCli = path.relative(projectRoot, path.join(playwrightPackageRoot, 'cli.js'));
const playwrightCliInContainer = path.posix.join('/tinymce', relativePlaywrightCli.split(path.sep).join(path.posix.sep));
const image = `mcr.microsoft.com/playwright:v${playwrightPackage.version}-noble`;

console.log(`Playwright package.json: ${playwrightPkg}`);
console.log(`Project root: ${projectRoot}`);
console.log(`Working directory: ${pwd}`);
console.log(`Docker image: ${image}`);

const dockerArgs = [
  'run',
  '--rm',
  '--name', CONTAINER_NAME,
  '--init',
  '-p', `${BROWSER_SERVER_PORT}:${BROWSER_SERVER_PORT}`,
  '-v', `${projectRoot}:/tinymce:ro`,
  '--workdir', '/tinymce',
  image,
  'node', playwrightCliInContainer,
  'run-server',
  '--port', String(BROWSER_SERVER_PORT),
  '--host', '0.0.0.0'
];

const docker = spawn('docker', dockerArgs, {
  stdio: [ 'ignore', 'pipe', 'pipe' ]
});

let dockerExited = false;
let shuttingDown = false;

const cleanup = () => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  if (!dockerExited) {
    spawnSync('docker', [ 'kill', CONTAINER_NAME ], { stdio: 'ignore' });
    docker.kill();
  }
};

// Wait for the server's "Listening on ws://..." line. Probing the TCP port is not
// reliable here: Docker's port-forward proxy accepts connections as soon as the
// container starts, well before the Playwright server inside is listening.
const waitForBrowserServer = () => new Promise((resolve, reject) => {
  const timeout = setTimeout(() => {
    reject(new Error(`Timed out waiting for Playwright browser server on port ${BROWSER_SERVER_PORT}`));
  }, 30_000);

  const ready = () => {
    clearTimeout(timeout);
    resolve();
  };

  docker.stdout.on('data', (data) => {
    process.stdout.write(data);
    if (data.toString().includes('ws://')) {
      ready();
    }
  });

  docker.stderr.on('data', (data) => {
    process.stderr.write(data);
    if (data.toString().includes('ws://')) {
      ready();
    }
  });

  docker.on('exit', (code) => {
    dockerExited = true;
    reject(new Error(`Playwright browser server exited before it was ready, return code ${code ?? 0}`));
  });

  // Fires when docker itself cannot be spawned (e.g. not installed / not on PATH);
  // without a listener Node would crash on the unhandled 'error' event.
  docker.on('error', (error) => {
    dockerExited = true;
    reject(new Error(`Failed to start Docker: ${error.message}`));
  });
});

const runVitest = () => new Promise((resolve) => {
  const isUpdate = process.argv[2] === 'update';
  const args = [ 'run', '--project', 'visual' ];
  // Forward any further CLI arguments to vitest (e.g. a file filter). They must come
  // before `--update`, otherwise the flag consumes the first filter as its value.
  args.push(...process.argv.slice(isUpdate ? 3 : 2));
  if (isUpdate) {
    args.push('--update');
  }

  const vitest = spawn('vitest', args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PW_WS_ENDPOINT
    }
  });

  vitest.on('exit', (code) => {
    resolve(code ?? 0);
  });

  vitest.on('error', (error) => {
    console.error('Failed to run Vitest', error);
    resolve(1);
  });
});

process.on('SIGINT', () => {
  cleanup();
  process.exit();
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit();
});

try {
  await waitForBrowserServer();
  const exitCode = await runVitest();
  cleanup();
  process.exit(exitCode);
} catch (error) {
  console.error('Script error:', error);
  cleanup();
  process.exit(1);
}
