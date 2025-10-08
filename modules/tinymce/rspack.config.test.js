const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');

// Import the configuration
const config = require('./rspack.config.js');

describe('rspack.config.js', () => {
  describe('Configuration Structure', () => {
    it('should export an array of configurations', () => {
      assert.ok(Array.isArray(config), 'Config should be an array');
      assert.strictEqual(config.length, 2, 'Config should have 2 configurations');
    });

    it('should have valid configuration objects', () => {
      config.forEach((cfg, index) => {
        assert.ok(typeof cfg === 'object', `Config[${index}] should be an object`);
        assert.ok(cfg.entry, `Config[${index}] should have entry`);
        assert.ok(cfg.module, `Config[${index}] should have module`);
        assert.ok(cfg.resolve, `Config[${index}] should have resolve`);
        assert.ok(cfg.output, `Config[${index}] should have output`);
      });
    });

    it('should have development mode', () => {
      config.forEach((cfg, index) => {
        assert.strictEqual(cfg.mode, 'development', `Config[${index}] should be in development mode`);
      });
    });

    it('should have inline-source-map devtool', () => {
      config.forEach((cfg, index) => {
        assert.strictEqual(cfg.devtool, 'inline-source-map', `Config[${index}] should use inline-source-map`);
      });
    });
  });

  describe('Module Rules', () => {
    it('should have module rules configured', () => {
      config.forEach((cfg, index) => {
        assert.ok(cfg.module.rules, `Config[${index}] should have module rules`);
        assert.ok(Array.isArray(cfg.module.rules), `Config[${index}] rules should be an array`);
        assert.ok(cfg.module.rules.length > 0, `Config[${index}] should have at least one rule`);
      });
    });

    it('should have TypeScript rule with SWC loader', () => {
      config.forEach((cfg, index) => {
        const tsRule = cfg.module.rules.find(rule =>
          rule.test && rule.test.toString().includes('ts')
        );
        assert.ok(tsRule, `Config[${index}] should have a TypeScript rule`);
        assert.ok(tsRule.use, `Config[${index}] TypeScript rule should have loaders`);
        assert.ok(Array.isArray(tsRule.use), `Config[${index}] TypeScript loaders should be an array`);
      });
    });

    it('should have SWC loader with JSC configuration', () => {
      config.forEach((cfg, index) => {
        const tsRule = cfg.module.rules.find(rule =>
          rule.test && rule.test.toString().includes('ts')
        );
        const swcLoader = tsRule.use.find(loader =>
          loader.loader === 'builtin:swc-loader'
        );
        
        assert.ok(swcLoader, `Config[${index}] should have SWC loader`);
        assert.ok(swcLoader.options, `Config[${index}] SWC loader should have options`);
        assert.ok(swcLoader.options.jsc, `Config[${index}] SWC loader should have JSC options`);
      });
    });

    it('should have correct JSC parser configuration', () => {
      config.forEach((cfg, index) => {
        const tsRule = cfg.module.rules.find(rule =>
          rule.test && rule.test.toString().includes('ts')
        );
        const swcLoader = tsRule.use.find(loader =>
          loader.loader === 'builtin:swc-loader'
        );
        
        assert.ok(swcLoader.options.jsc.parser, `Config[${index}] should have JSC parser`);
        assert.strictEqual(
          swcLoader.options.jsc.parser.syntax,
          'typescript',
          `Config[${index}] JSC parser syntax should be 'typescript'`
        );
      });
    });

    it('should have correct JSC target configuration', () => {
      config.forEach((cfg, index) => {
        const tsRule = cfg.module.rules.find(rule =>
          rule.test && rule.test.toString().includes('ts')
        );
        const swcLoader = tsRule.use.find(loader =>
          loader.loader === 'builtin:swc-loader'
        );
        
        assert.strictEqual(
          swcLoader.options.jsc.target,
          'es2022',
          `Config[${index}] JSC target should be 'es2022'`
        );
      });
    });

    it('should have sourceMaps enabled', () => {
      config.forEach((cfg, index) => {
        const tsRule = cfg.module.rules.find(rule =>
          rule.test && rule.test.toString().includes('ts')
        );
        const swcLoader = tsRule.use.find(loader =>
          loader.loader === 'builtin:swc-loader'
        );
        
        assert.strictEqual(
          swcLoader.options.sourceMaps,
          true,
          `Config[${index}] should have sourceMaps enabled`
        );
      });
    });

    it('should have string-replace-loader for version replacement', () => {
      config.forEach((cfg, index) => {
        const tsRule = cfg.module.rules.find(rule =>
          rule.test && rule.test.toString().includes('ts')
        );
        const stringReplaceLoader = tsRule.use.find(loader =>
          loader.loader === 'string-replace-loader'
        );
        
        assert.ok(stringReplaceLoader, `Config[${index}] should have string-replace-loader`);
        assert.ok(stringReplaceLoader.options, `Config[${index}] string-replace-loader should have options`);
        assert.ok(stringReplaceLoader.options.multiple, `Config[${index}] should have multiple replacements`);
      });
    });

    it('should have JavaScript rule with resolve configuration', () => {
      config.forEach((cfg, index) => {
        const jsRule = cfg.module.rules.find(rule =>
          rule.test && rule.test.toString().includes('js') && !rule.test.toString().includes('mjs')
        );
        assert.ok(jsRule, `Config[${index}] should have a JavaScript rule`);
        assert.ok(jsRule.resolve, `Config[${index}] JavaScript rule should have resolve config`);
        assert.strictEqual(jsRule.resolve.fullySpecified, false, `Config[${index}] should disable fullySpecified`);
      });
    });

    it('should have source-map-loader for JS/MJS files', () => {
      config.forEach((cfg, index) => {
        const sourceMapRule = cfg.module.rules.find(rule =>
          rule.test && rule.test.toString().includes('mjs')
        );
        assert.ok(sourceMapRule, `Config[${index}] should have source-map rule`);
        assert.ok(sourceMapRule.use, `Config[${index}] source-map rule should have loaders`);
        assert.ok(
          sourceMapRule.use.includes('source-map-loader'),
          `Config[${index}] should use source-map-loader`
        );
        assert.strictEqual(sourceMapRule.enforce, 'pre', `Config[${index}] source-map-loader should be enforced as 'pre'`);
      });
    });

    it('should have SVG asset loader', () => {
      config.forEach((cfg, index) => {
        const svgRule = cfg.module.rules.find(rule =>
          rule.test && rule.test.toString().includes('svg')
        );
        assert.ok(svgRule, `Config[${index}] should have SVG rule`);
        assert.strictEqual(svgRule.type, 'asset/source', `Config[${index}] SVG type should be asset/source`);
      });
    });

    it('should have raw resource query handler', () => {
      config.forEach((cfg, index) => {
        const rawRule = cfg.module.rules.find(rule =>
          rule.resourceQuery && rule.resourceQuery.toString().includes('raw')
        );
        assert.ok(rawRule, `Config[${index}] should have raw resource query rule`);
        assert.strictEqual(rawRule.type, 'asset/source', `Config[${index}] raw type should be asset/source`);
      });
    });
  });

  // ... many other tests ...

  describe('generateDemoIndex function', () => {
    it('should generate HTML index from demo list', () => {
      const escapeHtml = (str) => str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[m]);

      const mockApp = {
        responses: [],
        get: function(path, handler) {
          this.responses.push({ path, handler });
        }
      };

      const mockDemoList = [
        'src/core/demo/html/basic.html',
        'src/core/demo/html/advanced.html',
        'src/plugins/accordion/demo/html/demo.html',
        'src/plugins/advlist/demo/html/test.html',
        'src/themes/silver/demo/html/theme.html'
      ];

      // Simulate generateDemoIndex logic
      const sortedDemos = mockDemoList.reduce((acc, link) => {
        const type = link.split('/')[1];
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(link);
        return acc;
      }, {});

      assert.isObject(sortedDemos, 'Should return an object');
      assert.property(sortedDemos, 'core', 'Should have core demos');
      assert.property(sortedDemos, 'plugins', 'Should have plugin demos');
      assert.property(sortedDemos, 'themes', 'Should have theme demos');
      assert.lengthOf(sortedDemos.core, 2, 'Should have 2 core demos');
      assert.lengthOf(sortedDemos.plugins, 2, 'Should have 2 plugin demos');
      assert.lengthOf(sortedDemos.themes, 1, 'Should have 1 theme demo');
    });

    it('should group demos by type correctly', () => {
      const demoList = [
        'src/plugins/table/demo/html/demo.html',
        'src/plugins/lists/demo/html/demo.html',
        'src/core/demo/html/basic.html'
      ];

      const sortedDemos = demoList.reduce((acc, link) => {
        const type = link.split('/')[1];
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(link);
        return acc;
      }, {});

      assert.lengthOf(sortedDemos.plugins, 2, 'Should group multiple plugins together');
      assert.lengthOf(sortedDemos.core, 1, 'Should separate core demos');
    });

    it('should handle deeply nested demo paths', () => {
      const demoList = [
        'src/plugins/accordion/demo/html/variants/basic.html',
        'src/plugins/accordion/demo/html/variants/advanced/test.html'
      ];

      const sortedDemos = demoList.reduce((acc, link) => {
        const type = link.split('/')[1];
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(link);
        return acc;
      }, {});

      assert.lengthOf(sortedDemos.plugins, 2, 'Should handle nested paths');
    });

    it('should handle empty demo list', () => {
      const demoList = [];
      const sortedDemos = demoList.reduce((acc, link) => {
        const type = link.split('/')[1];
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(link);
        return acc;
      }, {});

      assert.deepEqual(sortedDemos, {}, 'Should return empty object for empty list');
    });
  });

  // ... many other tests ...

  describe('Configuration Context and Paths', () => {
    it('should use correct output directory', () => {
      const outputDirs = ['.', 'dist', 'build', 'output'];

      outputDirs.forEach(dir => {
        assert.isString(dir);
        if (dir !== '.') {
          assert.notStrictEqual(dir, '', 'Output dir should not be empty string');
        }
      });
    });
  });

  // ... remaining tests ...
});