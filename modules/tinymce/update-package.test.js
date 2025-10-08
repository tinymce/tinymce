const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

describe('update-package.js', () => {
  let originalReadFileSync;
  let originalWriteFileSync;
  let originalLog;
  let mockFileContent;
  let writtenContent;
  let logMessages;

  beforeEach(() => {
    // Store original functions
    originalReadFileSync = fs.readFileSync;
    originalWriteFileSync = fs.writeFileSync;
    originalLog = console.log;

    // Initialize test state
    mockFileContent = null;
    writtenContent = null;
    logMessages = [];

    // Mock fs.readFileSync
    fs.readFileSync = (filepath, encoding) => {
      if (filepath === 'package.json' && encoding === 'utf8') {
        if (mockFileContent === null) {
          throw new Error('Mock file content not set');
        }
        return mockFileContent;
      }
      return originalReadFileSync(filepath, encoding);
    };

    // Mock fs.writeFileSync
    fs.writeFileSync = (filepath, content) => {
      if (filepath === 'package.json') {
        writtenContent = content;
        return;
      }
      return originalWriteFileSync(filepath, content);
    };

    // Mock console.log
    console.log = (message) => {
      logMessages.push(message);
    };
  });

  afterEach(() => {
    // Restore original functions
    fs.readFileSync = originalReadFileSync;
    fs.writeFileSync = originalWriteFileSync;
    console.log = originalLog;

    // Clear require cache to allow re-running the script
    delete require.cache[require.resolve('./update-package.js')];
  });

  describe('Happy Path - Scripts Do Not Exist', () => {
    it('should add test-config and test-all scripts when they do not exist', () => {
      mockFileContent = JSON.stringify({
        name: 'test-package',
        version: '1.0.0',
        scripts: {
          build: 'npm run build'
        }
      }, null, 2);

      require('./update-package.js');

      assert.ok(writtenContent, 'Should have written to package.json');
      const writtenPkg = JSON.parse(writtenContent);
      
      assert.strictEqual(writtenPkg.scripts['test-config'], 'node rspack.config.test.js');
      assert.strictEqual(writtenPkg.scripts['test-all'], 'npm run test && npm run test-config');
      assert.strictEqual(writtenPkg.scripts.build, 'npm run build', 'Should preserve existing scripts');
    });

    it('should log success message when scripts are added', () => {
      mockFileContent = JSON.stringify({
        name: 'test-package',
        scripts: {}
      }, null, 2);

      require('./update-package.js');

      assert.strictEqual(logMessages.length, 1);
      assert.strictEqual(logMessages[0], '✓ Added test-config and test-all scripts to package.json');
    });

    it('should format JSON output with 2 spaces and trailing newline', () => {
      mockFileContent = JSON.stringify({
        name: 'test-package',
        scripts: {}
      }, null, 2);

      require('./update-package.js');

      assert.ok(writtenContent.endsWith('\n'), 'Should end with newline');
      
      // Verify proper indentation
      const lines = writtenContent.split('\n');
      const scriptLine = lines.find(l => l.includes('"scripts"'));
      assert.ok(scriptLine, 'Should have scripts section');
      assert.ok(scriptLine.match(/^\s{2}"/), 'Should use 2-space indentation');
    });

    it('should preserve all existing package.json properties', () => {
      mockFileContent = JSON.stringify({
        name: 'test-package',
        version: '2.3.4',
        description: 'A test package',
        author: 'Test Author',
        license: 'MIT',
        dependencies: {
          'some-dep': '^1.0.0'
        },
        devDependencies: {
          'some-dev-dep': '^2.0.0'
        },
        scripts: {
          test: 'npm test',
          build: 'npm run build'
        }
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.strictEqual(writtenPkg.name, 'test-package');
      assert.strictEqual(writtenPkg.version, '2.3.4');
      assert.strictEqual(writtenPkg.description, 'A test package');
      assert.strictEqual(writtenPkg.author, 'Test Author');
      assert.strictEqual(writtenPkg.license, 'MIT');
      assert.deepStrictEqual(writtenPkg.dependencies, { 'some-dep': '^1.0.0' });
      assert.deepStrictEqual(writtenPkg.devDependencies, { 'some-dev-dep': '^2.0.0' });
      assert.strictEqual(writtenPkg.scripts.test, 'npm test');
      assert.strictEqual(writtenPkg.scripts.build, 'npm run build');
    });
  });

  describe('Edge Case - Scripts Property Does Not Exist', () => {
    it('should add scripts property if it does not exist', () => {
      mockFileContent = JSON.stringify({
        name: 'test-package',
        version: '1.0.0'
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.ok(writtenPkg.scripts, 'Should have scripts property');
      assert.strictEqual(writtenPkg.scripts['test-config'], 'node rspack.config.test.js');
      assert.strictEqual(writtenPkg.scripts['test-all'], 'npm run test && npm run test-config');
    });

    it('should handle null scripts property', () => {
      mockFileContent = JSON.stringify({
        name: 'test-package',
        version: '1.0.0',
        scripts: null
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.ok(writtenPkg.scripts, 'Should have scripts property');
      assert.strictEqual(writtenPkg.scripts['test-config'], 'node rspack.config.test.js');
    });

    it('should handle undefined scripts property', () => {
      mockFileContent = JSON.stringify({
        name: 'test-package',
        version: '1.0.0'
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.ok(writtenPkg.scripts, 'Should have scripts property');
      assert.strictEqual(typeof writtenPkg.scripts, 'object');
    });
  });

  describe('Edge Case - Scripts Already Exist', () => {
    it('should not modify package.json when test-config script exists', () => {
      mockFileContent = JSON.stringify({
        name: 'test-package',
        scripts: {
          'test-config': 'node rspack.config.test.js',
          'test-all': 'npm run test && npm run test-config'
        }
      }, null, 2);

      require('./update-package.js');

      assert.strictEqual(writtenContent, null, 'Should not write to file');
    });

    it('should log appropriate message when scripts already exist', () => {
      mockFileContent = JSON.stringify({
        name: 'test-package',
        scripts: {
          'test-config': 'existing command'
        }
      }, null, 2);

      require('./update-package.js');

      assert.strictEqual(logMessages.length, 1);
      assert.strictEqual(logMessages[0], '✓ Test scripts already exist in package.json');
    });

    it('should not add test-all when only test-config exists', () => {
      mockFileContent = JSON.stringify({
        name: 'test-package',
        scripts: {
          'test-config': 'some existing command'
        }
      }, null, 2);

      require('./update-package.js');

      assert.strictEqual(writtenContent, null, 'Should not modify file');
      assert.strictEqual(logMessages[0], '✓ Test scripts already exist in package.json');
    });

    it('should detect existing test-config with different command', () => {
      mockFileContent = JSON.stringify({
        name: 'test-package',
        scripts: {
          'test-config': 'node different-config.js'
        }
      }, null, 2);

      require('./update-package.js');

      assert.strictEqual(writtenContent, null);
      assert.ok(logMessages[0].includes('already exist'));
    });
  });

  describe('Empty and Minimal Configurations', () => {
    it('should handle empty package.json with minimal properties', () => {
      mockFileContent = JSON.stringify({}, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.ok(writtenPkg.scripts);
      assert.strictEqual(writtenPkg.scripts['test-config'], 'node rspack.config.test.js');
    });

    it('should handle package.json with empty scripts object', () => {
      mockFileContent = JSON.stringify({
        name: 'test-package',
        scripts: {}
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.strictEqual(Object.keys(writtenPkg.scripts).length, 2);
      assert.strictEqual(writtenPkg.scripts['test-config'], 'node rspack.config.test.js');
      assert.strictEqual(writtenPkg.scripts['test-all'], 'npm run test && npm run test-config');
    });

    it('should handle package.json with only name property', () => {
      mockFileContent = JSON.stringify({
        name: 'minimal-package'
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.strictEqual(writtenPkg.name, 'minimal-package');
      assert.ok(writtenPkg.scripts);
    });
  });

  describe('Script Command Verification', () => {
    it('should use correct command for test-config script', () => {
      mockFileContent = JSON.stringify({
        scripts: {}
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.strictEqual(writtenPkg.scripts['test-config'], 'node rspack.config.test.js');
    });

    it('should use correct command for test-all script', () => {
      mockFileContent = JSON.stringify({
        scripts: {}
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.strictEqual(writtenPkg.scripts['test-all'], 'npm run test && npm run test-config');
    });

    it('should add both scripts together atomically', () => {
      mockFileContent = JSON.stringify({
        scripts: {
          build: 'existing'
        }
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.ok(writtenPkg.scripts['test-config']);
      assert.ok(writtenPkg.scripts['test-all']);
      assert.strictEqual(Object.keys(writtenPkg.scripts).length, 3);
    });
  });

  describe('JSON Formatting and Structure', () => {
    it('should maintain consistent JSON structure', () => {
      mockFileContent = JSON.stringify({
        name: 'test',
        version: '1.0.0',
        scripts: { test: 'test' }
      }, null, 2);

      require('./update-package.js');

      // Verify JSON is parseable
      assert.doesNotThrow(() => {
        JSON.parse(writtenContent);
      });
    });

    it('should use consistent indentation throughout', () => {
      mockFileContent = JSON.stringify({
        name: 'test',
        nested: {
          deep: {
            property: 'value'
          }
        },
        scripts: {}
      }, null, 2);

      require('./update-package.js');

      const lines = writtenContent.split('\n').filter(l => l.trim().length > 0);
      const indentedLines = lines.filter(l => l.match(/^\s+/));
      
      // All indented lines should use multiples of 2 spaces
      indentedLines.forEach(line => {
        const spaces = line.match(/^\s+/)[0].length;
        assert.strictEqual(spaces % 2, 0, 'Indentation should be multiple of 2');
      });
    });

    it('should preserve property order where possible', () => {
      mockFileContent = JSON.stringify({
        name: 'test-package',
        version: '1.0.0',
        description: 'Test',
        scripts: {},
        dependencies: {}
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      const keys = Object.keys(writtenPkg);
      
      // Verify all original keys are present
      assert.ok(keys.includes('name'));
      assert.ok(keys.includes('version'));
      assert.ok(keys.includes('description'));
      assert.ok(keys.includes('scripts'));
      assert.ok(keys.includes('dependencies'));
    });
  });

  describe('Multiple Scripts Interaction', () => {
    it('should preserve existing test script when adding new ones', () => {
      mockFileContent = JSON.stringify({
        scripts: {
          test: 'jest',
          lint: 'eslint .',
          build: 'webpack'
        }
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.strictEqual(writtenPkg.scripts.test, 'jest');
      assert.strictEqual(writtenPkg.scripts.lint, 'eslint .');
      assert.strictEqual(writtenPkg.scripts.build, 'webpack');
      assert.strictEqual(writtenPkg.scripts['test-config'], 'node rspack.config.test.js');
      assert.strictEqual(writtenPkg.scripts['test-all'], 'npm run test && npm run test-config');
    });

    it('should handle many existing scripts without conflicts', () => {
      const manyScripts = {};
      for (let i = 0; i < 20; i++) {
        manyScripts[`script-${i}`] = `command-${i}`;
      }

      mockFileContent = JSON.stringify({
        scripts: manyScripts
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.strictEqual(Object.keys(writtenPkg.scripts).length, 22);
      
      // Verify all original scripts are preserved
      for (let i = 0; i < 20; i++) {
        assert.strictEqual(writtenPkg.scripts[`script-${i}`], `command-${i}`);
      }
    });

    it('should not affect scripts with similar names', () => {
      mockFileContent = JSON.stringify({
        scripts: {
          'test': 'jest',
          'test-unit': 'jest unit',
          'test-integration': 'jest integration',
          'config': 'some config'
        }
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.strictEqual(writtenPkg.scripts.test, 'jest');
      assert.strictEqual(writtenPkg.scripts['test-unit'], 'jest unit');
      assert.strictEqual(writtenPkg.scripts['test-integration'], 'jest integration');
      assert.strictEqual(writtenPkg.scripts.config, 'some config');
    });
  });

  describe('Package.json Property Preservation', () => {
    it('should preserve complex nested structures', () => {
      mockFileContent = JSON.stringify({
        name: 'test',
        config: {
          port: 3000,
          env: {
            development: true,
            production: false
          }
        },
        scripts: {},
        repository: {
          type: 'git',
          url: 'https://github.com/test/test.git'
        }
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.deepStrictEqual(writtenPkg.config, {
        port: 3000,
        env: {
          development: true,
          production: false
        }
      });
      assert.deepStrictEqual(writtenPkg.repository, {
        type: 'git',
        url: 'https://github.com/test/test.git'
      });
    });

    it('should preserve arrays in package.json', () => {
      mockFileContent = JSON.stringify({
        keywords: ['test', 'package', 'node'],
        files: ['dist/', 'lib/', 'src/'],
        scripts: {}
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.deepStrictEqual(writtenPkg.keywords, ['test', 'package', 'node']);
      assert.deepStrictEqual(writtenPkg.files, ['dist/', 'lib/', 'src/']);
    });

    it('should preserve boolean and numeric values', () => {
      mockFileContent = JSON.stringify({
        private: true,
        version: '1.2.3',
        config: {
          timeout: 5000,
          enabled: false
        },
        scripts: {}
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.strictEqual(writtenPkg.private, true);
      assert.strictEqual(writtenPkg.config.timeout, 5000);
      assert.strictEqual(writtenPkg.config.enabled, false);
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent - running twice should have same result', () => {
      mockFileContent = JSON.stringify({
        name: 'test-package',
        scripts: {
          build: 'webpack'
        }
      }, null, 2);

      // First run
      require('./update-package.js');
      const firstWrite = writtenContent;
      delete require.cache[require.resolve('./update-package.js')];

      // Second run - use the output of first run as input
      mockFileContent = firstWrite;
      writtenContent = null;
      logMessages = [];
      
      require('./update-package.js');

      // Should not write on second run
      assert.strictEqual(writtenContent, null);
      assert.strictEqual(logMessages[0], '✓ Test scripts already exist in package.json');
    });
  });

  describe('Edge Cases - Special Characters and Escaping', () => {
    it('should handle script commands with special characters', () => {
      mockFileContent = JSON.stringify({
        name: 'test-package',
        scripts: {
          'special': 'echo "hello && world"'
        }
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.strictEqual(writtenPkg.scripts.special, 'echo "hello && world"');
      assert.strictEqual(writtenPkg.scripts['test-all'], 'npm run test && npm run test-config');
    });

    it('should handle package names with special characters', () => {
      mockFileContent = JSON.stringify({
        name: '@scope/package-name',
        scripts: {}
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.strictEqual(writtenPkg.name, '@scope/package-name');
    });

    it('should handle string values with quotes', () => {
      mockFileContent = JSON.stringify({
        description: 'A "quoted" description',
        scripts: {}
      }, null, 2);

      require('./update-package.js');

      const writtenPkg = JSON.parse(writtenContent);
      assert.strictEqual(writtenPkg.description, 'A "quoted" description');
    });
  });

  describe('File System Interaction', () => {
    it('should read from package.json with utf8 encoding', () => {
      let readCalls = [];
      fs.readFileSync = (filepath, encoding) => {
        readCalls.push({ filepath, encoding });
        return JSON.stringify({ scripts: {} }, null, 2);
      };

      require('./update-package.js');

      assert.strictEqual(readCalls.length, 1);
      assert.strictEqual(readCalls[0].filepath, 'package.json');
      assert.strictEqual(readCalls[0].encoding, 'utf8');
    });

    it('should write to package.json when changes are made', () => {
      let writeCalls = [];
      fs.writeFileSync = (filepath, content) => {
        writeCalls.push({ filepath, content });
      };
      mockFileContent = JSON.stringify({ scripts: {} }, null, 2);

      require('./update-package.js');

      assert.strictEqual(writeCalls.length, 1);
      assert.strictEqual(writeCalls[0].filepath, 'package.json');
      assert.ok(writeCalls[0].content);
    });

    it('should not write to package.json when no changes needed', () => {
      let writeCalls = [];
      fs.writeFileSync = (filepath, content) => {
        writeCalls.push({ filepath, content });
      };
      mockFileContent = JSON.stringify({
        scripts: {
          'test-config': 'node rspack.config.test.js'
        }
      }, null, 2);

      require('./update-package.js');

      assert.strictEqual(writeCalls.length, 0);
    });
  });

  describe('Console Output', () => {
    it('should output exactly one message per execution', () => {
      mockFileContent = JSON.stringify({ scripts: {} }, null, 2);

      require('./update-package.js');

      assert.strictEqual(logMessages.length, 1);
    });

    it('should use checkmark symbol in success messages', () => {
      mockFileContent = JSON.stringify({ scripts: {} }, null, 2);

      require('./update-package.js');

      assert.ok(logMessages[0].includes('✓'));
    });

    it('should provide clear feedback about actions taken', () => {
      mockFileContent = JSON.stringify({ scripts: {} }, null, 2);

      require('./update-package.js');

      assert.ok(logMessages[0].includes('Added'));
      assert.ok(logMessages[0].includes('test-config'));
      assert.ok(logMessages[0].includes('test-all'));
    });

    it('should provide clear feedback when no action needed', () => {
      mockFileContent = JSON.stringify({
        scripts: { 'test-config': 'existing' }
      }, null, 2);

      require('./update-package.js');

      assert.ok(logMessages[0].includes('already exist'));
    });
  });
});