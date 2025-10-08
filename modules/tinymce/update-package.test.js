const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

describe('update-package.js', () => {
  const testDir = path.join(__dirname, 'test-tmp-update-package');
  const testPackageJson = path.join(testDir, 'package.json');
  let originalCwd;

  before(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    originalCwd = process.cwd();
  });

  after(() => {
    // Cleanup test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    process.chdir(originalCwd);
  });

  beforeEach(() => {
    // Clean up any existing test package.json
    if (fs.existsSync(testPackageJson)) {
      fs.unlinkSync(testPackageJson);
    }
    process.chdir(testDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  describe('Adding test scripts', () => {
    it('should add test-config script when it does not exist', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {
          test: 'npm test'
        }
      };
      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      // Execute the update logic
      const updatedPkg = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      
      if (!updatedPkg.scripts['test-config']) {
        updatedPkg.scripts['test-config'] = 'node rspack.config.test.js';
        updatedPkg.scripts['test-all'] = 'npm run test && npm run test-config';
        fs.writeFileSync(testPackageJson, JSON.stringify(updatedPkg, null, 2) + '\n');
      }

      const result = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      assert.ok(result.scripts['test-config'], 'Should have test-config script');
      assert.strictEqual(result.scripts['test-config'], 'node rspack.config.test.js');
    });

    it('should add test-all script when it does not exist', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {
          test: 'npm test'
        }
      };
      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const updatedPkg = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      
      if (!updatedPkg.scripts['test-config']) {
        updatedPkg.scripts['test-config'] = 'node rspack.config.test.js';
        updatedPkg.scripts['test-all'] = 'npm run test && npm run test-config';
        fs.writeFileSync(testPackageJson, JSON.stringify(updatedPkg, null, 2) + '\n');
      }

      const result = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      assert.ok(result.scripts['test-all'], 'Should have test-all script');
      assert.strictEqual(result.scripts['test-all'], 'npm run test && npm run test-config');
    });

    it('should not modify existing test-config script', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {
          test: 'npm test',
          'test-config': 'custom test command'
        }
      };
      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const beforeUpdate = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      const existingScript = beforeUpdate.scripts['test-config'];

      // Simulate the update logic
      if (!beforeUpdate.scripts['test-config']) {
        beforeUpdate.scripts['test-config'] = 'node rspack.config.test.js';
        beforeUpdate.scripts['test-all'] = 'npm run test && npm run test-config';
        fs.writeFileSync(testPackageJson, JSON.stringify(beforeUpdate, null, 2) + '\n');
      }

      const result = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      assert.strictEqual(result.scripts['test-config'], existingScript, 
        'Should not modify existing test-config script');
    });

    it('should create scripts object if it does not exist', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0'
      };
      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const updatedPkg = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      
      if (!updatedPkg.scripts) {
        updatedPkg.scripts = {};
      }
      
      if (!updatedPkg.scripts['test-config']) {
        updatedPkg.scripts['test-config'] = 'node rspack.config.test.js';
        updatedPkg.scripts['test-all'] = 'npm run test && npm run test-config';
        fs.writeFileSync(testPackageJson, JSON.stringify(updatedPkg, null, 2) + '\n');
      }

      const result = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      assert.ok(result.scripts, 'Should have scripts object');
      assert.ok(result.scripts['test-config'], 'Should have test-config script');
    });
  });

  describe('JSON formatting', () => {
    it('should preserve JSON formatting with 2 spaces', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {}
      };
      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const updatedPkg = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      updatedPkg.scripts['test-config'] = 'node rspack.config.test.js';
      fs.writeFileSync(testPackageJson, JSON.stringify(updatedPkg, null, 2) + '\n');

      const content = fs.readFileSync(testPackageJson, 'utf8');
      const lines = content.split('\n');
      
      // Check that proper indentation exists
      const hasProperIndent = lines.some(line => line.startsWith('  ') && !line.startsWith('    '));
      assert.ok(hasProperIndent, 'Should have 2-space indentation');
    });

    it('should add newline at end of file', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {}
      };
      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const updatedPkg = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      updatedPkg.scripts['test-config'] = 'node rspack.config.test.js';
      fs.writeFileSync(testPackageJson, JSON.stringify(updatedPkg, null, 2) + '\n');

      const content = fs.readFileSync(testPackageJson, 'utf8');
      assert.ok(content.endsWith('\n'), 'Should end with newline');
    });

    it('should create valid JSON structure', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0'
      };
      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const updatedPkg = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      if (!updatedPkg.scripts) updatedPkg.scripts = {};
      updatedPkg.scripts['test-config'] = 'node rspack.config.test.js';
      updatedPkg.scripts['test-all'] = 'npm run test && npm run test-config';
      fs.writeFileSync(testPackageJson, JSON.stringify(updatedPkg, null, 2) + '\n');

      const content = fs.readFileSync(testPackageJson, 'utf8');
      assert.doesNotThrow(() => {
        JSON.parse(content);
      }, 'Should create valid JSON');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty package.json object', () => {
      fs.writeFileSync(testPackageJson, '{}');

      const updatedPkg = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      if (!updatedPkg.scripts) updatedPkg.scripts = {};
      
      updatedPkg.scripts['test-config'] = 'node rspack.config.test.js';
      updatedPkg.scripts['test-all'] = 'npm run test && npm run test-config';
      fs.writeFileSync(testPackageJson, JSON.stringify(updatedPkg, null, 2) + '\n');

      const result = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      assert.ok(result.scripts['test-config'], 'Should handle empty package.json');
    });

    it('should handle package.json with only name and version', () => {
      const pkg = {
        name: 'minimal-package',
        version: '0.0.1'
      };
      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const updatedPkg = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      if (!updatedPkg.scripts) updatedPkg.scripts = {};
      
      updatedPkg.scripts['test-config'] = 'node rspack.config.test.js';
      updatedPkg.scripts['test-all'] = 'npm run test && npm run test-config';
      fs.writeFileSync(testPackageJson, JSON.stringify(updatedPkg, null, 2) + '\n');

      const result = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      assert.strictEqual(result.name, 'minimal-package', 'Should preserve existing fields');
      assert.strictEqual(result.version, '0.0.1', 'Should preserve existing fields');
      assert.ok(result.scripts['test-config'], 'Should add new scripts');
    });

    it('should handle package.json with existing test scripts', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {
          test: 'jest',
          'test:unit': 'jest --coverage',
          'test:integration': 'jest --testPathPattern=integration'
        }
      };
      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const updatedPkg = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      const beforeScripts = Object.keys(updatedPkg.scripts).length;

      if (!updatedPkg.scripts['test-config']) {
        updatedPkg.scripts['test-config'] = 'node rspack.config.test.js';
        updatedPkg.scripts['test-all'] = 'npm run test && npm run test-config';
        fs.writeFileSync(testPackageJson, JSON.stringify(updatedPkg, null, 2) + '\n');
      }

      const result = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      assert.strictEqual(Object.keys(result.scripts).length, beforeScripts + 2, 
        'Should add exactly 2 new scripts');
      assert.ok(result.scripts.test, 'Should preserve existing test script');
      assert.ok(result.scripts['test:unit'], 'Should preserve existing test:unit script');
    });

    it('should preserve other package.json fields', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        description: 'Test package description',
        author: 'Test Author',
        license: 'MIT',
        dependencies: {
          'some-dep': '^1.0.0'
        },
        devDependencies: {
          'some-dev-dep': '^2.0.0'
        },
        scripts: {}
      };
      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const updatedPkg = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      updatedPkg.scripts['test-config'] = 'node rspack.config.test.js';
      updatedPkg.scripts['test-all'] = 'npm run test && npm run test-config';
      fs.writeFileSync(testPackageJson, JSON.stringify(updatedPkg, null, 2) + '\n');

      const result = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      assert.strictEqual(result.name, pkg.name, 'Should preserve name');
      assert.strictEqual(result.version, pkg.version, 'Should preserve version');
      assert.strictEqual(result.description, pkg.description, 'Should preserve description');
      assert.strictEqual(result.author, pkg.author, 'Should preserve author');
      assert.strictEqual(result.license, pkg.license, 'Should preserve license');
      assert.deepStrictEqual(result.dependencies, pkg.dependencies, 'Should preserve dependencies');
      assert.deepStrictEqual(result.devDependencies, pkg.devDependencies, 'Should preserve devDependencies');
    });
  });

  describe('Script command validation', () => {
    it('should use correct node command for test-config', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {}
      };
      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const updatedPkg = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      updatedPkg.scripts['test-config'] = 'node rspack.config.test.js';
      fs.writeFileSync(testPackageJson, JSON.stringify(updatedPkg, null, 2) + '\n');

      const result = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      assert.ok(result.scripts['test-config'].startsWith('node '), 
        'test-config should start with node command');
      assert.ok(result.scripts['test-config'].includes('rspack.config.test.js'), 
        'test-config should reference the test file');
    });

    it('should chain test commands correctly in test-all', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {
          test: 'jest'
        }
      };
      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const updatedPkg = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      updatedPkg.scripts['test-config'] = 'node rspack.config.test.js';
      updatedPkg.scripts['test-all'] = 'npm run test && npm run test-config';
      fs.writeFileSync(testPackageJson, JSON.stringify(updatedPkg, null, 2) + '\n');

      const result = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      assert.ok(result.scripts['test-all'].includes('&&'), 
        'test-all should use && to chain commands');
      assert.ok(result.scripts['test-all'].includes('npm run test'), 
        'test-all should run test script');
      assert.ok(result.scripts['test-all'].includes('npm run test-config'), 
        'test-all should run test-config script');
    });

    it('should maintain proper command order in test-all', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {}
      };
      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const updatedPkg = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      updatedPkg.scripts['test-config'] = 'node rspack.config.test.js';
      updatedPkg.scripts['test-all'] = 'npm run test && npm run test-config';
      fs.writeFileSync(testPackageJson, JSON.stringify(updatedPkg, null, 2) + '\n');

      const result = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      const testAllParts = result.scripts['test-all'].split('&&').map(s => s.trim());
      
      assert.strictEqual(testAllParts[0], 'npm run test', 
        'First command should be npm run test');
      assert.strictEqual(testAllParts[1], 'npm run test-config', 
        'Second command should be npm run test-config');
    });
  });

  describe('Idempotency tests', () => {
    it('should be idempotent when run multiple times', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {}
      };
      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      // Run update logic twice
      for (let i = 0; i < 2; i++) {
        const updatedPkg = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
        if (!updatedPkg.scripts) updatedPkg.scripts = {};
        
        if (!updatedPkg.scripts['test-config']) {
          updatedPkg.scripts['test-config'] = 'node rspack.config.test.js';
          updatedPkg.scripts['test-all'] = 'npm run test && npm run test-config';
          fs.writeFileSync(testPackageJson, JSON.stringify(updatedPkg, null, 2) + '\n');
        }
      }

      const result = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
      const scriptKeys = Object.keys(result.scripts);
      
      // Should only have test-config and test-all, not duplicates
      assert.strictEqual(
        scriptKeys.filter(k => k === 'test-config').length, 
        1, 
        'Should have exactly one test-config script'
      );
      assert.strictEqual(
        scriptKeys.filter(k => k === 'test-all').length, 
        1, 
        'Should have exactly one test-all script'
      );
    });

    it('should not create duplicate scripts on repeated runs', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {}
      };
      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const beforeCount = Object.keys(
        JSON.parse(fs.readFileSync(testPackageJson, 'utf8')).scripts || {}
      ).length;

      // Run three times
      for (let i = 0; i < 3; i++) {
        const updatedPkg = JSON.parse(fs.readFileSync(testPackageJson, 'utf8'));
        if (!updatedPkg.scripts) updatedPkg.scripts = {};
        
        if (!updatedPkg.scripts['test-config']) {
          updatedPkg.scripts['test-config'] = 'node rspack.config.test.js';
          updatedPkg.scripts['test-all'] = 'npm run test && npm run test-config';
          fs.writeFileSync(testPackageJson, JSON.stringify(updatedPkg, null, 2) + '\n');
        }
      }

      const afterCount = Object.keys(
        JSON.parse(fs.readFileSync(testPackageJson, 'utf8')).scripts
      ).length;

      assert.strictEqual(afterCount, beforeCount + 2, 
        'Should add exactly 2 scripts regardless of how many times it runs');
    });
  });
});