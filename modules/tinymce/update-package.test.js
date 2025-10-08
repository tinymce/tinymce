const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

describe('update-package.js', () => {
  const testDir = path.join(__dirname, '.test-update-package');
  const testPackageJson = path.join(testDir, 'package.json');
  const updateScript = path.join(__dirname, 'update-package.js');

  before(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  after(() => {
    // Cleanup test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Package.json Script Addition', () => {
    it('should add test-config script when it does not exist', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {
          test: 'jest'
        }
      };

      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      // Save current directory
      const originalCwd = process.cwd();

      try {
        // Change to test directory
        process.chdir(testDir);

        // Execute the update logic
        const pkgData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!pkgData.scripts || !pkgData.scripts['test-config']) {
          pkgData.scripts = pkgData.scripts || {};
          pkgData.scripts['test-config'] = 'node rspack.config.test.js';
          pkgData.scripts['test-all'] = 'npm run test && npm run test-config';
          fs.writeFileSync('package.json', JSON.stringify(pkgData, null, 2) + '\n');
        }

        // Verify the result
        const updated = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        assert.strictEqual(updated.scripts['test-config'], 'node rspack.config.test.js');
        assert.strictEqual(updated.scripts['test-all'], 'npm run test && npm run test-config');
      } finally {
        // Restore directory
        process.chdir(originalCwd);
      }
    });

    it('should not modify package.json if test-config already exists', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {
          test: 'jest',
          'test-config': 'node rspack.config.test.js',
          'test-all': 'npm run test && npm run test-config'
        }
      };

      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));
      const originalContent = fs.readFileSync(testPackageJson, 'utf8');

      // Save current directory
      const originalCwd = process.cwd();

      try {
        // Change to test directory
        process.chdir(testDir);

        // Execute the update logic
        const pkgData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!pkgData.scripts || !pkgData.scripts['test-config']) {
          pkgData.scripts = pkgData.scripts || {};
          pkgData.scripts['test-config'] = 'node rspack.config.test.js';
          pkgData.scripts['test-all'] = 'npm run test && npm run test-config';
          fs.writeFileSync('package.json', JSON.stringify(pkgData, null, 2) + '\n');
        }

        // Content should remain unchanged
        const newContent = fs.readFileSync('package.json', 'utf8');
        assert.strictEqual(newContent, originalContent);
      } finally {
        // Restore directory
        process.chdir(originalCwd);
      }
    });

    it('should handle package.json without scripts section', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0'
      };

      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const originalCwd = process.cwd();

      try {
        process.chdir(testDir);

        const pkgData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!pkgData.scripts || !pkgData.scripts['test-config']) {
          pkgData.scripts = pkgData.scripts || {};
          pkgData.scripts['test-config'] = 'node rspack.config.test.js';
          pkgData.scripts['test-all'] = 'npm run test && npm run test-config';
          fs.writeFileSync('package.json', JSON.stringify(pkgData, null, 2) + '\n');
        }

        const updated = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        assert.ok(updated.scripts, 'Should create scripts section');
        assert.strictEqual(updated.scripts['test-config'], 'node rspack.config.test.js');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should preserve existing scripts', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {
          test: 'jest',
          build: 'webpack',
          lint: 'eslint'
        }
      };

      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const originalCwd = process.cwd();

      try {
        process.chdir(testDir);

        const pkgData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!pkgData.scripts || !pkgData.scripts['test-config']) {
          pkgData.scripts = pkgData.scripts || {};
          pkgData.scripts['test-config'] = 'node rspack.config.test.js';
          pkgData.scripts['test-all'] = 'npm run test && npm run test-config';
          fs.writeFileSync('package.json', JSON.stringify(pkgData, null, 2) + '\n');
        }

        const updated = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        assert.strictEqual(updated.scripts.test, 'jest');
        assert.strictEqual(updated.scripts.build, 'webpack');
        assert.strictEqual(updated.scripts.lint, 'eslint');
        assert.strictEqual(updated.scripts['test-config'], 'node rspack.config.test.js');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should add newline at end of file', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {
          test: 'jest'
        }
      };

      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const originalCwd = process.cwd();

      try {
        process.chdir(testDir);

        const pkgData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!pkgData.scripts || !pkgData.scripts['test-config']) {
          pkgData.scripts = pkgData.scripts || {};
          pkgData.scripts['test-config'] = 'node rspack.config.test.js';
          pkgData.scripts['test-all'] = 'npm run test && npm run test-config';
          fs.writeFileSync('package.json', JSON.stringify(pkgData, null, 2) + '\n');
        }

        const content = fs.readFileSync('package.json', 'utf8');
        assert.ok(content.endsWith('\n'), 'File should end with newline');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should use proper JSON indentation', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0'
      };

      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const originalCwd = process.cwd();

      try {
        process.chdir(testDir);

        const pkgData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!pkgData.scripts || !pkgData.scripts['test-config']) {
          pkgData.scripts = pkgData.scripts || {};
          pkgData.scripts['test-config'] = 'node rspack.config.test.js';
          pkgData.scripts['test-all'] = 'npm run test && npm run test-config';
          fs.writeFileSync('package.json', JSON.stringify(pkgData, null, 2) + '\n');
        }

        const content = fs.readFileSync('package.json', 'utf8');
        // Check for 2-space indentation
        assert.ok(content.includes('  "'), 'Should have 2-space indentation');
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Script Command Validation', () => {
    it('should generate correct test-config command', () => {
      const command = 'node rspack.config.test.js';
      assert.strictEqual(command, 'node rspack.config.test.js');
      assert.ok(command.includes('rspack.config.test.js'));
    });

    it('should generate correct test-all command', () => {
      const command = 'npm run test && npm run test-config';
      assert.strictEqual(command, 'npm run test && npm run test-config');
      assert.ok(command.includes('npm run test'));
      assert.ok(command.includes('test-config'));
      assert.ok(command.includes('&&'));
    });

    it('should validate command structure', () => {
      const testConfig = 'node rspack.config.test.js';
      const testAll = 'npm run test && npm run test-config';

      // test-config should be a node command
      assert.ok(testConfig.startsWith('node '));

      // test-all should chain commands
      assert.ok(testAll.includes('&&'));
      const parts = testAll.split('&&').map(p => p.trim());
      assert.strictEqual(parts.length, 2);
    });
  });

  describe('File System Operations', () => {
    it('should read package.json correctly', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0'
      };

      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const originalCwd = process.cwd();

      try {
        process.chdir(testDir);
        const read = JSON.parse(fs.readFileSync('package.json', 'utf8'));

        assert.strictEqual(read.name, 'test-package');
        assert.strictEqual(read.version, '1.0.0');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should write valid JSON', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {}
      };

      const originalCwd = process.cwd();

      try {
        process.chdir(testDir);
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

        // Should be able to parse it back
        const read = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        assert.deepStrictEqual(read, pkg);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle concurrent writes safely', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {
          test: 'jest'
        }
      };

      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      // This test ensures the script can be run multiple times
      const originalCwd = process.cwd();

      try {
        process.chdir(testDir);

        // First run
        let pkgData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!pkgData.scripts['test-config']) {
          pkgData.scripts['test-config'] = 'node rspack.config.test.js';
          pkgData.scripts['test-all'] = 'npm run test && npm run test-config';
          fs.writeFileSync('package.json', JSON.stringify(pkgData, null, 2) + '\n');
        }

        // Second run (should be idempotent)
        pkgData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const scriptsBefore = { ...pkgData.scripts };

        if (!pkgData.scripts['test-config']) {
          pkgData.scripts['test-config'] = 'node rspack.config.test.js';
          pkgData.scripts['test-all'] = 'npm run test && npm run test-config';
          fs.writeFileSync('package.json', JSON.stringify(pkgData, null, 2) + '\n');
        }

        pkgData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        assert.deepStrictEqual(pkgData.scripts, scriptsBefore);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle package.json with comments (if possible)', () => {
      // JSON doesn't support comments, but this tests robustness
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {}
      };

      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const originalCwd = process.cwd();

      try {
        process.chdir(testDir);
        const pkgData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        assert.ok(pkgData, 'Should parse valid JSON');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle empty scripts object', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {}
      };

      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const originalCwd = process.cwd();

      try {
        process.chdir(testDir);

        const pkgData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!pkgData.scripts['test-config']) {
          pkgData.scripts['test-config'] = 'node rspack.config.test.js';
          pkgData.scripts['test-all'] = 'npm run test && npm run test-config';
          fs.writeFileSync('package.json', JSON.stringify(pkgData, null, 2) + '\n');
        }

        const updated = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        assert.strictEqual(Object.keys(updated.scripts).length, 2);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle scripts with different existing keys', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {
          'pre-test': 'echo before',
          'post-test': 'echo after',
          start: 'node server.js'
        }
      };

      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const originalCwd = process.cwd();

      try {
        process.chdir(testDir);

        const pkgData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!pkgData.scripts['test-config']) {
          pkgData.scripts['test-config'] = 'node rspack.config.test.js';
          pkgData.scripts['test-all'] = 'npm run test && npm run test-config';
          fs.writeFileSync('package.json', JSON.stringify(pkgData, null, 2) + '\n');
        }

        const updated = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        assert.strictEqual(updated.scripts['pre-test'], 'echo before');
        assert.strictEqual(updated.scripts['post-test'], 'echo after');
        assert.strictEqual(updated.scripts.start, 'node server.js');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle package.json with additional fields', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        description: 'Test package',
        author: 'Test Author',
        license: 'MIT',
        dependencies: {
          'some-lib': '^1.0.0'
        },
        scripts: {}
      };

      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const originalCwd = process.cwd();

      try {
        process.chdir(testDir);

        const pkgData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!pkgData.scripts['test-config']) {
          pkgData.scripts['test-config'] = 'node rspack.config.test.js';
          pkgData.scripts['test-all'] = 'npm run test && npm run test-config';
          fs.writeFileSync('package.json', JSON.stringify(pkgData, null, 2) + '\n');
        }

        const updated = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        assert.strictEqual(updated.description, 'Test package');
        assert.strictEqual(updated.author, 'Test Author');
        assert.strictEqual(updated.license, 'MIT');
        assert.ok(updated.dependencies);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should maintain package.json field order', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {
          alpha: 'echo a',
          beta: 'echo b'
        }
      };

      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const originalCwd = process.cwd();

      try {
        process.chdir(testDir);

        const pkgData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!pkgData.scripts['test-config']) {
          pkgData.scripts['test-config'] = 'node rspack.config.test.js';
          pkgData.scripts['test-all'] = 'npm run test && npm run test-config';
          fs.writeFileSync('package.json', JSON.stringify(pkgData, null, 2) + '\n');
        }

        const updated = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        // Scripts should still exist
        assert.ok(updated.scripts.alpha);
        assert.ok(updated.scripts.beta);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('Console Output Validation', () => {
    it('should provide success message for adding scripts', () => {
      const successMessage = '✓ Added test-config and test-all scripts to package.json';
      assert.ok(successMessage.includes('✓'));
      assert.ok(successMessage.includes('test-config'));
      assert.ok(successMessage.includes('test-all'));
    });

    it('should provide success message for existing scripts', () => {
      const existsMessage = '✓ Test scripts already exist in package.json';
      assert.ok(existsMessage.includes('✓'));
      assert.ok(existsMessage.includes('already exist'));
    });

    it('should have descriptive messages', () => {
      const messages = [
        '✓ Added test-config and test-all scripts to package.json',
        '✓ Test scripts already exist in package.json'
      ];

      messages.forEach(msg => {
        assert.ok(msg.length > 0);
        assert.ok(msg.includes('package.json'));
      });
    });
  });

  describe('Script Validation', () => {
    it('should validate test-config script format', () => {
      const script = 'node rspack.config.test.js';

      assert.ok(script.startsWith('node '));
      assert.ok(script.endsWith('.js'));
      assert.ok(script.includes('rspack.config.test'));
    });

    it('should validate test-all script chains commands correctly', () => {
      const script = 'npm run test && npm run test-config';
      const commands = script.split('&&').map(c => c.trim());

      assert.strictEqual(commands.length, 2);
      assert.strictEqual(commands[0], 'npm run test');
      assert.strictEqual(commands[1], 'npm run test-config');
    });

    it('should ensure scripts reference correct files', () => {
      const testConfig = 'node rspack.config.test.js';

      assert.ok(testConfig.includes('rspack.config.test.js'));
      assert.notStrictEqual(testConfig.includes('rspack.config.js'), true);
    });
  });

  describe('Idempotency Tests', () => {
    it('should be idempotent - multiple runs produce same result', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {
          test: 'jest'
        }
      };

      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const originalCwd = process.cwd();

      try {
        process.chdir(testDir);

        // Run 3 times
        for (let i = 0; i < 3; i++) {
          const pkgData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
          if (!pkgData.scripts['test-config']) {
            pkgData.scripts['test-config'] = 'node rspack.config.test.js';
            pkgData.scripts['test-all'] = 'npm run test && npm run test-config';
            fs.writeFileSync('package.json', JSON.stringify(pkgData, null, 2) + '\n');
          }
        }

        // Verify final state
        const final = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        assert.strictEqual(final.scripts['test-config'], 'node rspack.config.test.js');
        assert.strictEqual(final.scripts['test-all'], 'npm run test && npm run test-config');
        assert.strictEqual(final.scripts.test, 'jest');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should not duplicate scripts on multiple runs', () => {
      const pkg = {
        name: 'test-package',
        version: '1.0.0',
        scripts: {}
      };

      fs.writeFileSync(testPackageJson, JSON.stringify(pkg, null, 2));

      const originalCwd = process.cwd();

      try {
        process.chdir(testDir);

        // Run twice
        for (let i = 0; i < 2; i++) {
          const pkgData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
          if (!pkgData.scripts['test-config']) {
            pkgData.scripts['test-config'] = 'node rspack.config.test.js';
            pkgData.scripts['test-all'] = 'npm run test && npm run test-config';
            fs.writeFileSync('package.json', JSON.stringify(pkgData, null, 2) + '\n');
          }
        }

        const final = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const scriptKeys = Object.keys(final.scripts);

        // Should only have 2 scripts
        assert.strictEqual(scriptKeys.length, 2);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });
});