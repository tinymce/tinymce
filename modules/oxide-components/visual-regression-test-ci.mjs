import { exec, execSync } from 'child_process';
import { setTimeout } from 'timers';


const devServer = exec('yarn start --ci');

// Wait for the server to start
setTimeout(() => {
  execSync('yarn playwright test', {
    stdio: 'inherit'
  });
  devServer.kill()
  process.exit(0)
}, 5000);
