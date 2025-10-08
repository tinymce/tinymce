const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add test-config script if it does not exist
if (!pkg.scripts || !pkg.scripts['test-config']) {
  pkg.scripts['test-config'] = 'node rspack.config.test.js';
  pkg.scripts['test-all'] = 'npm run test && npm run test-config';

  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  console.log('✓ Added test-config and test-all scripts to package.json');
} else {
  console.log('✓ Test scripts already exist in package.json');
}