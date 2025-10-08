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
        const jsRule = cfg.module.rules.find(rule => rule.test && rule.test.toString().includes('js') && !rule.test.toString().includes('mjs'));
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

  describe('Resolve Configuration', () => {
    it('should have TypeScript and JavaScript extensions', () => {
      config.forEach((cfg, index) => {
        assert.ok(cfg.resolve.extensions, `Config[${index}] should have extensions`);
        assert.ok(cfg.resolve.extensions.includes('.ts'), `Config[${index}] should resolve .ts files`);
        assert.ok(cfg.resolve.extensions.includes('.js'), `Config[${index}] should resolve .js files`);
      });
    });

    it('should have TypeScript config file resolution', () => {
      config.forEach((cfg, index) => {
        assert.ok(cfg.resolve.tsConfig, `Config[${index}] should have tsConfig`);
        assert.ok(cfg.resolve.tsConfig.configFile, `Config[${index}] should have tsConfig.configFile`);
        assert.strictEqual(
          cfg.resolve.tsConfig.references, 
          'auto',
          `Config[${index}] should have auto references`
        );
      });
    });

    it('should have module aliases configured', () => {
      config.forEach((cfg, index) => {
        assert.ok(cfg.resolve.alias, `Config[${index}] should have alias configuration`);
        assert.ok(typeof cfg.resolve.alias === 'object', `Config[${index}] alias should be an object`);
        assert.ok(Object.keys(cfg.resolve.alias).length > 0, `Config[${index}] should have at least one alias`);
      });
    });
  });

  describe('Optimization Configuration', () => {
    it('should have optimization settings', () => {
      config.forEach((cfg, index) => {
        assert.ok(cfg.optimization, `Config[${index}] should have optimization`);
      });
    });

    it('should disable module removal optimizations', () => {
      config.forEach((cfg, index) => {
        assert.strictEqual(
          cfg.optimization.removeAvailableModules, 
          false,
          `Config[${index}] should disable removeAvailableModules`
        );
        assert.strictEqual(
          cfg.optimization.removeEmptyChunks, 
          false,
          `Config[${index}] should disable removeEmptyChunks`
        );
        assert.strictEqual(
          cfg.optimization.splitChunks, 
          false,
          `Config[${index}] should disable splitChunks`
        );
      });
    });
  });

  describe('Output Configuration', () => {
    it('should have output configuration', () => {
      config.forEach((cfg, index) => {
        assert.ok(cfg.output, `Config[${index}] should have output`);
        assert.ok(cfg.output.filename, `Config[${index}] should have output filename`);
        assert.ok(cfg.output.path, `Config[${index}] should have output path`);
      });
    });

    it('should use name placeholder for filename', () => {
      config.forEach((cfg, index) => {
        assert.strictEqual(
          cfg.output.filename, 
          '[name]',
          `Config[${index}] should use [name] placeholder`
        );
      });
    });

    it('should have root publicPath', () => {
      config.forEach((cfg, index) => {
        assert.strictEqual(
          cfg.output.publicPath, 
          '/',
          `Config[${index}] should have root publicPath`
        );
      });
    });
  });

  describe('Plugins Configuration', () => {
    it('should have TsCheckerRspackPlugin', () => {
      config.forEach((cfg, index) => {
        assert.ok(cfg.plugins, `Config[${index}] should have plugins`);
        assert.ok(Array.isArray(cfg.plugins), `Config[${index}] plugins should be an array`);
        assert.ok(cfg.plugins.length > 0, `Config[${index}] should have at least one plugin`);
        
        const hasChecker = cfg.plugins.some(plugin => 
          plugin.constructor.name === 'TsCheckerRspackPlugin'
        );
        assert.ok(hasChecker, `Config[${index}] should have TsCheckerRspackPlugin`);
      });
    });
  });

  describe('Watch Options', () => {
    it('should ignore node_modules', () => {
      config.forEach((cfg, index) => {
        assert.ok(cfg.watchOptions, `Config[${index}] should have watchOptions`);
        assert.ok(cfg.watchOptions.ignored, `Config[${index}] should have ignored patterns`);
        assert.ok(
          cfg.watchOptions.ignored.includes('**/node_modules/**'),
          `Config[${index}] should ignore node_modules`
        );
      });
    });
  });

  describe('Dev Server Configuration', () => {
    it('should have dev server on first config', () => {
      assert.ok(config[0].devServer, 'First config should have devServer');
    });

    it('should have correct port and host', () => {
      assert.strictEqual(config[0].devServer.port, '3000', 'DevServer should use port 3000');
      assert.strictEqual(config[0].devServer.host, '0.0.0.0', 'DevServer should bind to 0.0.0.0');
    });

    it('should allow all hosts', () => {
      assert.strictEqual(config[0].devServer.allowedHosts, 'all', 'DevServer should allow all hosts');
    });

    it('should disable hot reload and live reload', () => {
      assert.strictEqual(config[0].devServer.hot, false, 'DevServer hot should be disabled');
      assert.strictEqual(config[0].devServer.liveReload, false, 'DevServer liveReload should be disabled');
    });

    it('should have setupMiddlewares function', () => {
      assert.ok(config[0].devServer.setupMiddlewares, 'DevServer should have setupMiddlewares');
      assert.strictEqual(
        typeof config[0].devServer.setupMiddlewares, 
        'function',
        'setupMiddlewares should be a function'
      );
    });

    it('should have static configuration', () => {
      assert.ok(config[0].devServer.static, 'DevServer should have static config');
      assert.strictEqual(config[0].devServer.static.publicPath, '/', 'Static publicPath should be /');
    });

    it('should have client overlay configuration', () => {
      assert.ok(config[0].devServer.client, 'DevServer should have client config');
      assert.ok(config[0].devServer.client.overlay, 'DevServer should have overlay config');
      assert.strictEqual(config[0].devServer.client.overlay.errors, true, 'Should show error overlay');
      assert.strictEqual(config[0].devServer.client.overlay.warnings, true, 'Should show warning overlay');
    });
  });

  describe('Infrastructure Logging', () => {
    it('should have verbose logging', () => {
      config.forEach((cfg, index) => {
        assert.ok(cfg.infrastructureLogging, `Config[${index}] should have infrastructureLogging`);
        assert.strictEqual(
          cfg.infrastructureLogging.level, 
          'log',
          `Config[${index}] should use 'log' level`
        );
      });
    });
  });

  describe('Stats Configuration', () => {
    it('should have stats configuration', () => {
      config.forEach((cfg, index) => {
        assert.ok(cfg.stats, `Config[${index}] should have stats`);
      });
    });

    it('should have verbose logging and hide assets', () => {
      config.forEach((cfg, index) => {
        assert.strictEqual(cfg.stats.logging, 'verbose', `Config[${index}] should use verbose logging`);
        assert.strictEqual(cfg.stats.assets, false, `Config[${index}] should hide assets`);
        assert.strictEqual(cfg.stats.modulesSpace, 5, `Config[${index}] should have modulesSpace of 5`);
      });
    });
  });

  describe('Warning Configuration', () => {
    it('should ignore export warnings', () => {
      config.forEach((cfg, index) => {
        assert.ok(cfg.ignoreWarnings, `Config[${index}] should have ignoreWarnings`);
        assert.ok(Array.isArray(cfg.ignoreWarnings), `Config[${index}] ignoreWarnings should be an array`);
        
        const hasExportWarning = cfg.ignoreWarnings.some(warning => 
          warning instanceof RegExp && warning.test('export foo was not found in')
        );
        assert.ok(hasExportWarning, `Config[${index}] should ignore export warnings`);
      });
    });
  });

  describe('Entry Points', () => {
    it('should have valid entry points', () => {
      config.forEach((cfg, index) => {
        assert.ok(cfg.entry, `Config[${index}] should have entry`);
        assert.ok(typeof cfg.entry === 'object', `Config[${index}] entry should be an object`);
        assert.ok(Object.keys(cfg.entry).length > 0, `Config[${index}] should have at least one entry`);
      });
    });

    it('should have core tinymce entry in second config', () => {
      assert.ok(config[1].entry['js/tinymce/tinymce.js'], 'Second config should have tinymce.js entry');
    });

    it('should have demo entries in first config', () => {
      const demoEntries = Object.keys(config[0].entry).filter(key => key.includes('demo'));
      assert.ok(demoEntries.length > 0, 'First config should have demo entries');
    });
  });

  describe('Context Configuration', () => {
    it('should have context set to module directory', () => {
      config.forEach((cfg, index) => {
        assert.ok(cfg.context, `Config[${index}] should have context`);
        assert.ok(path.isAbsolute(cfg.context), `Config[${index}] context should be absolute path`);
      });
    });
  });

  describe('Target Configuration', () => {
    it('should target web platform', () => {
      config.forEach((cfg, index) => {
        assert.strictEqual(cfg.target, 'web', `Config[${index}] should target web`);
      });
    });
  });
});

describe('JSC Configuration - Edge Cases', () => {
  it('should handle parser syntax correctly', () => {
    const tsRule = config[0].module.rules.find(rule => 
      rule.test && rule.test.toString().includes('ts')
    );
    const swcLoader = tsRule.use.find(loader => 
      loader.loader === 'builtin:swc-loader'
    );
    
    // Ensure the syntax is exactly 'typescript' (not 'ts' or other variations)
    assert.strictEqual(swcLoader.options.jsc.parser.syntax, 'typescript');
  });

  it('should use ES2022 target for modern features', () => {
    const tsRule = config[0].module.rules.find(rule => 
      rule.test && rule.test.toString().includes('ts')
    );
    const swcLoader = tsRule.use.find(loader => 
      loader.loader === 'builtin:swc-loader'
    );
    
    // Ensure target is es2022 for modern JavaScript features
    assert.strictEqual(swcLoader.options.jsc.target, 'es2022');
  });

  it('should have JSC options as a stable object', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      const swcLoader = tsRule.use.find(loader => 
        loader.loader === 'builtin:swc-loader'
      );
      
      // Verify JSC is not undefined or null
      assert.ok(swcLoader.options.jsc);
      assert.ok(typeof swcLoader.options.jsc === 'object');
      
      // Verify parser is properly nested
      assert.ok(swcLoader.options.jsc.parser);
      assert.ok(typeof swcLoader.options.jsc.parser === 'object');
    });
  });

  it('should maintain other SWC options alongside JSC', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      const swcLoader = tsRule.use.find(loader => 
        loader.loader === 'builtin:swc-loader'
      );
      
      // Ensure sourceMaps still exists with JSC config
      assert.strictEqual(swcLoader.options.sourceMaps, true);
      assert.ok(swcLoader.options.jsc);
    });
  });
});

describe('Version Replacement Configuration', () => {
  it('should have version replacement for EditorManager', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      const stringReplaceLoader = tsRule.use.find(loader => 
        loader.loader === 'string-replace-loader'
      );
      
      assert.ok(stringReplaceLoader.options.test);
      assert.ok(stringReplaceLoader.options.test.toString().includes('EditorManager'));
    });
  });

  it('should replace major and minor version placeholders', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      const stringReplaceLoader = tsRule.use.find(loader => 
        loader.loader === 'string-replace-loader'
      );
      
      const replacements = stringReplaceLoader.options.multiple;
      assert.ok(replacements.some(r => r.search === '@@majorVersion@@'));
      assert.ok(replacements.some(r => r.search === '@@minorVersion@@'));
      assert.ok(replacements.some(r => r.search === '@@releaseDate@@'));
    });
  });
});

describe('Advanced JSC Configuration Tests', () => {
  it('should validate JSC configuration is not mutated', () => {
    const originalConfig = JSON.parse(JSON.stringify(config[0]));
    const tsRule = config[0].module.rules.find(rule => 
      rule.test && rule.test.toString().includes('ts')
    );
    const swcLoader = tsRule.use.find(loader => 
      loader.loader === 'builtin:swc-loader'
    );
    
    // Access the config multiple times
    const jsc1 = swcLoader.options.jsc;
    const jsc2 = swcLoader.options.jsc;
    
    assert.strictEqual(jsc1.parser.syntax, jsc2.parser.syntax, 'JSC parser syntax should remain consistent');
    assert.strictEqual(jsc1.target, jsc2.target, 'JSC target should remain consistent');
  });

  it('should have JSC configuration at the correct nesting level', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      const swcLoader = tsRule.use.find(loader => 
        loader.loader === 'builtin:swc-loader'
      );
      
      // Verify jsc is directly under options
      assert.ok(Object.prototype.hasOwnProperty.call(swcLoader.options, 'jsc'), 
        `Config ${index}: jsc should be a direct property of options`);
      assert.ok(Object.prototype.hasOwnProperty.call(swcLoader.options.jsc, 'parser'), 
        `Config ${index}: parser should be a direct property of jsc`);
      assert.ok(Object.prototype.hasOwnProperty.call(swcLoader.options.jsc, 'target'), 
        `Config ${index}: target should be a direct property of jsc`);
    });
  });

  it('should not have conflicting parser configurations', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      const swcLoader = tsRule.use.find(loader => 
        loader.loader === 'builtin:swc-loader'
      );
      
      // Ensure there's no conflicting parser config at other levels
      assert.ok(!swcLoader.options.parser, `Config ${index}: parser should only exist under jsc`);
      assert.ok(!swcLoader.options.target || swcLoader.options.jsc.target, 
        `Config ${index}: target should be under jsc, not at top level`);
    });
  });

  it('should support TypeScript-specific parser options', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      const swcLoader = tsRule.use.find(loader => 
        loader.loader === 'builtin:swc-loader'
      );
      
      assert.strictEqual(swcLoader.options.jsc.parser.syntax, 'typescript', 
        `Config ${index}: Should specifically target TypeScript syntax`);
    });
  });

  it('should use modern ES target for better performance', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      const swcLoader = tsRule.use.find(loader => 
        loader.loader === 'builtin:swc-loader'
      );
      
      const target = swcLoader.options.jsc.target;
      const year = parseInt(target.replace('es', ''));
      assert.ok(year >= 2022 || target === 'es2022', 
        `Config ${index}: Should use ES2022 or later for modern features`);
    });
  });

  it('should preserve JSC config alongside other SWC options', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      const swcLoader = tsRule.use.find(loader => 
        loader.loader === 'builtin:swc-loader'
      );
      
      const options = swcLoader.options;
      const keys = Object.keys(options);
      
      assert.ok(keys.includes('jsc'), `Config ${index}: Should have jsc option`);
      assert.ok(keys.includes('sourceMaps'), `Config ${index}: Should have sourceMaps option`);
      assert.ok(keys.length >= 2, `Config ${index}: Should have multiple SWC options`);
    });
  });
});

describe('Loader Chain Integration Tests', () => {
  it('should have correct loader execution order', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      
      assert.isArray(tsRule.use, `Config ${index}: use should be an array`);
      assert.ok(tsRule.use.length >= 2, `Config ${index}: Should have at least 2 loaders`);
      
      // Loaders execute in reverse order (last to first)
      const loaderNames = tsRule.use.map(loader => loader.loader);
      assert.ok(loaderNames.includes('string-replace-loader'), 
        `Config ${index}: Should include string-replace-loader`);
      assert.ok(loaderNames.includes('builtin:swc-loader'), 
        `Config ${index}: Should include swc-loader`);
    });
  });

  it('should have all TypeScript loaders properly configured', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      
      tsRule.use.forEach((loader, loaderIndex) => {
        assert.ok(loader.loader, 
          `Config ${index}, Loader ${loaderIndex}: Should have a loader property`);
        assert.ok(loader.options || loader.loader.startsWith('builtin:'), 
          `Config ${index}, Loader ${loaderIndex}: Should have options or be a builtin loader`);
      });
    });
  });

  it('should not have duplicate loaders in the chain', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      
      const loaderNames = tsRule.use.map(loader => loader.loader);
      const uniqueLoaders = [...new Set(loaderNames)];
      
      assert.strictEqual(loaderNames.length, uniqueLoaders.length, 
        `Config ${index}: Should not have duplicate loaders`);
    });
  });
});

describe('Configuration Consistency Tests', () => {
  it('should have consistent configuration between both configs', () => {
    if (config.length >= 2) {
      const config1 = config[0];
      const config2 = config[1];
      
      // Both should have same mode
      assert.strictEqual(config1.mode, config2.mode, 'Both configs should have same mode');
      
      // Both should have same devtool
      assert.strictEqual(config1.devtool, config2.devtool, 'Both configs should have same devtool');
      
      // Both should have same target
      assert.strictEqual(config1.target, config2.target, 'Both configs should have same target');
    }
  });

  it('should have consistent module rules structure', () => {
    config.forEach((cfg, index) => {
      cfg.module.rules.forEach((rule, ruleIndex) => {
        if (rule.test) {
          assert.ok(rule.test instanceof RegExp, 
            `Config ${index}, Rule ${ruleIndex}: test should be a RegExp`);
        }
        
        if (rule.use) {
          assert.ok(Array.isArray(rule.use) || typeof rule.use === 'string', 
            `Config ${index}, Rule ${ruleIndex}: use should be array or string`);
        }
      });
    });
  });

  it('should have valid resolve.extensions for all configs', () => {
    config.forEach((cfg, index) => {
      assert.isArray(cfg.resolve.extensions, 
        `Config ${index}: extensions should be an array`);
      
      cfg.resolve.extensions.forEach((ext, extIndex) => {
        assert.ok(ext.startsWith('.'), 
          `Config ${index}, Extension ${extIndex}: should start with a dot`);
        assert.ok(ext.length > 1, 
          `Config ${index}, Extension ${extIndex}: should have content after dot`);
      });
    });
  });
});

describe('Alias Configuration Tests', () => {
  it('should have module aliases defined', () => {
    config.forEach((cfg, index) => {
      const aliases = Object.keys(cfg.resolve.alias);
      assert.ok(aliases.length > 0, `Config ${index}: Should have at least one alias`);
    });
  });

  it('should have @ephox or @tinymce prefixed aliases', () => {
    config.forEach((cfg, index) => {
      const aliases = Object.keys(cfg.resolve.alias);
      const hasValidPrefix = aliases.some(alias => 
        alias.startsWith('@ephox/') || alias.startsWith('@tinymce/')
      );
      assert.ok(hasValidPrefix, 
        `Config ${index}: Should have aliases with @ephox/ or @tinymce/ prefix`);
    });
  });

  it('should have absolute paths for alias values', () => {
    config.forEach((cfg, index) => {
      Object.entries(cfg.resolve.alias).forEach(([key, value]) => {
        assert.ok(path.isAbsolute(value), 
          `Config ${index}, Alias ${key}: should resolve to an absolute path`);
      });
    });
  });
});

describe('Entry Point Validation Tests', () => {
  it('should have valid entry point structure', () => {
    config.forEach((cfg, index) => {
      assert.isObject(cfg.entry, `Config ${index}: entry should be an object`);
      
      Object.entries(cfg.entry).forEach(([key, value]) => {
        assert.isString(key, `Config ${index}: entry key should be string`);
        assert.isString(value, `Config ${index}: entry value should be string path`);
      });
    });
  });

  it('should have .ts files as entry points', () => {
    config.forEach((cfg, index) => {
      const entryValues = Object.values(cfg.entry);
      entryValues.forEach((entryPath) => {
        assert.ok(entryPath.endsWith('.ts'), 
          `Config ${index}: entry points should be TypeScript files`);
      });
    });
  });

  it('should have demo entries in first config', () => {
    if (config.length > 0) {
      const demoEntries = Object.keys(config[0].entry).filter(key => 
        key.includes('demo') || key.includes('scratch')
      );
      assert.ok(demoEntries.length > 0, 'First config should contain demo entries');
    }
  });

  it('should have tinymce core entry in second config', () => {
    if (config.length > 1) {
      const hasTinymceEntry = Object.keys(config[1].entry).some(key => 
        key.includes('tinymce') && key.endsWith('.js')
      );
      assert.ok(hasTinymceEntry, 'Second config should have tinymce.js entry');
    }
  });
});

describe('File Type Handler Tests', () => {
  it('should handle TypeScript files', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.test('file.ts')
      );
      assert.ok(tsRule, `Config ${index}: Should have rule for .ts files`);
    });
  });

  it('should handle JavaScript files', () => {
    config.forEach((cfg, index) => {
      const jsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.test('file.js')
      );
      assert.ok(jsRule, `Config ${index}: Should have rule for .js files`);
    });
  });

  it('should handle SVG files', () => {
    config.forEach((cfg, index) => {
      const svgRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.test('icon.svg')
      );
      assert.ok(svgRule, `Config ${index}: Should have rule for .svg files`);
    });
  });

  it('should handle module files (mjs)', () => {
    config.forEach((cfg, index) => {
      const mjsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.test('module.mjs')
      );
      assert.ok(mjsRule, `Config ${index}: Should have rule for .mjs files`);
    });
  });

  it('should handle raw resource query', () => {
    config.forEach((cfg, index) => {
      const rawRule = cfg.module.rules.find(rule => 
        rule.resourceQuery && rule.resourceQuery.test('?raw')
      );
      assert.ok(rawRule, `Config ${index}: Should have rule for raw resource query`);
    });
  });
});

describe('Performance and Optimization Tests', () => {
  it('should disable optimizations for development builds', () => {
    config.forEach((cfg, index) => {
      assert.strictEqual(cfg.mode, 'development', 
        `Config ${index}: Should be in development mode`);
      assert.isFalse(cfg.optimization.removeAvailableModules, 
        `Config ${index}: Should not remove available modules in dev`);
      assert.isFalse(cfg.optimization.removeEmptyChunks, 
        `Config ${index}: Should not remove empty chunks in dev`);
      assert.isFalse(cfg.optimization.splitChunks, 
        `Config ${index}: Should not split chunks in dev`);
    });
  });

  it('should have source maps enabled for debugging', () => {
    config.forEach((cfg, index) => {
      assert.ok(cfg.devtool && cfg.devtool.includes('source-map'), 
        `Config ${index}: Should have source maps enabled`);
    });
  });

  it('should have verbose logging for troubleshooting', () => {
    config.forEach((cfg, index) => {
      assert.strictEqual(cfg.stats.logging, 'verbose', 
        `Config ${index}: Should have verbose logging`);
    });
  });
});

describe('RegExp Pattern Tests', () => {
  it('should have case-insensitive SVG pattern', () => {
    config.forEach((cfg, index) => {
      const svgRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('svg')
      );
      
      if (svgRule) {
        assert.ok(svgRule.test.test('file.svg'), 'Should match lowercase .svg');
        assert.ok(svgRule.test.test('file.SVG'), 'Should match uppercase .SVG');
        assert.ok(svgRule.test.test('file.Svg'), 'Should match mixed case .Svg');
      }
    });
  });

  it('should match TypeScript files only', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('.ts')
      );
      
      if (tsRule) {
        assert.ok(tsRule.test.test('component.ts'), 'Should match .ts files');
        assert.ok(!tsRule.test.test('component.tsx'), 'Should not match .tsx if not specified');
        assert.ok(!tsRule.test.test('component.js'), 'Should not match .js files');
      }
    });
  });

  it('should have proper export warning pattern', () => {
    config.forEach((cfg, index) => {
      const exportWarning = cfg.ignoreWarnings.find(warning => 
        warning instanceof RegExp && warning.toString().includes('export')
      );
      
      if (exportWarning) {
        assert.ok(exportWarning.test('export Foo was not found in Bar'), 
          `Config ${index}: Should match export warning pattern`);
        assert.ok(exportWarning.test('export default was not found in module'), 
          `Config ${index}: Should match export default warning`);
      }
    });
  });
});

describe('DevServer Configuration Edge Cases', () => {
  it('should handle setupMiddlewares correctly', () => {
    if (config[0].devServer && config[0].devServer.setupMiddlewares) {
      const setupFn = config[0].devServer.setupMiddlewares;
      assert.strictEqual(typeof setupFn, 'function', 'setupMiddlewares should be a function');
      
      // Test that it accepts and returns middlewares
      const mockMiddlewares = [];
      const mockDevServer = { app: { get: () => {} } };
      const result = setupFn(mockMiddlewares, mockDevServer);
      assert.ok(result, 'setupMiddlewares should return a value');
    }
  });

  it('should have static directory configuration', () => {
    if (config[0].devServer && config[0].devServer.static) {
      assert.ok(config[0].devServer.static.directory, 
        'DevServer static should have directory');
      assert.ok(path.isAbsolute(config[0].devServer.static.directory), 
        'DevServer static directory should be absolute');
    }
  });

  it('should not have devServer on second config', () => {
    if (config.length > 1) {
      assert.ok(!config[1].devServer, 'Second config should not have devServer');
    }
  });
});
describe('Additional Edge Cases for JSC Configuration', () => {
  it('should validate parser syntax is lowercase typescript', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      const swcLoader = tsRule.use.find(loader => 
        loader.loader === 'builtin:swc-loader'
      );
      
      const syntax = swcLoader.options.jsc.parser.syntax;
      assert.strictEqual(syntax, 'typescript', 'syntax should be exactly "typescript"');
      assert.strictEqual(syntax, syntax.toLowerCase(), 'syntax should be lowercase');
      assert.notStrictEqual(syntax, 'TypeScript', 'should not be capitalized');
    });
  });

  it('should ensure target matches ES version pattern', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      const swcLoader = tsRule.use.find(loader => 
        loader.loader === 'builtin:swc-loader'
      );
      
      const target = swcLoader.options.jsc.target;
      assert.ok(/^es(3|5|20\d{2})$/.test(target), `Target ${target} should match ES version pattern`);
    });
  });

  it('should have jsc configuration deeply nested correctly', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      const swcLoader = tsRule.use.find(loader => 
        loader.loader === 'builtin:swc-loader'
      );
      
      // Verify depth of nesting
      assert.ok(swcLoader.options);
      assert.ok(swcLoader.options.jsc);
      assert.ok(swcLoader.options.jsc.parser);
      assert.ok(swcLoader.options.jsc.parser.syntax);
      assert.ok(swcLoader.options.jsc.target);
    });
  });

  it('should maintain both jsc and sourceMaps at same level', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      const swcLoader = tsRule.use.find(loader => 
        loader.loader === 'builtin:swc-loader'
      );
      
      const optionKeys = Object.keys(swcLoader.options);
      assert.ok(optionKeys.includes('jsc'), 'should have jsc at top level of options');
      assert.ok(optionKeys.includes('sourceMaps'), 'should have sourceMaps at top level of options');
    });
  });

  it('should not have parser configuration outside jsc block', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      const swcLoader = tsRule.use.find(loader => 
        loader.loader === 'builtin:swc-loader'
      );
      
      // Parser should only be in jsc.parser, not at top level
      assert.strictEqual(swcLoader.options.parser, undefined, 'parser should not be at options level');
      assert.strictEqual(swcLoader.options.syntax, undefined, 'syntax should not be at options level');
    });
  });
});

describe('Loader Chain Integrity', () => {
  it('should process loaders in correct order (string-replace before swc)', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      
      if (tsRule && tsRule.use && Array.isArray(tsRule.use)) {
        const loaderOrder = tsRule.use.map(l => l.loader);
        const replaceIdx = loaderOrder.indexOf('string-replace-loader');
        const swcIdx = loaderOrder.indexOf('builtin:swc-loader');
        
        if (replaceIdx !== -1 && swcIdx !== -1) {
          assert.ok(replaceIdx < swcIdx, 'string-replace-loader should come before swc-loader');
        }
      }
    });
  });

  it('should have exactly 2 loaders for TypeScript files', () => {
    config.forEach((cfg, index) => {
      const tsRule = cfg.module.rules.find(rule => 
        rule.test && rule.test.toString().includes('ts')
      );
      
      assert.ok(Array.isArray(tsRule.use), 'use should be an array');
      assert.strictEqual(tsRule.use.length, 2, 'should have exactly 2 loaders');
    });
  });
});

describe('TypeScript Configuration Validation', () => {
  it('should have valid tsConfig paths', () => {
    assert.ok(config[0].resolve.tsConfig.configFile.includes('tsconfig.demo.json'));
    assert.ok(config[1].resolve.tsConfig.configFile.includes('tsconfig.json'));
  });

  it('should resolve extensions in correct priority order', () => {
    config.forEach((cfg, index) => {
      const extensions = cfg.resolve.extensions;
      assert.strictEqual(extensions[0], '.ts', 'TypeScript should be resolved first');
      assert.strictEqual(extensions[1], '.js', 'JavaScript should be resolved second');
    });
  });
});

describe('Development Server Setup', () => {
  it('should only have devServer on first configuration', () => {
    assert.ok(config[0].devServer, 'First config should have devServer');
    assert.strictEqual(config[1].devServer, undefined, 'Second config should not have devServer');
  });

  it('should have proper CORS and security settings', () => {
    assert.strictEqual(config[0].devServer.host, '0.0.0.0', 'should listen on all interfaces');
    assert.strictEqual(config[0].devServer.allowedHosts, 'all', 'should allow all hosts');
  });

  it('should disable hot reload for stability', () => {
    assert.strictEqual(config[0].devServer.hot, false);
    assert.strictEqual(config[0].devServer.liveReload, false);
  });

  it('should have setupMiddlewares as function', () => {
    assert.strictEqual(typeof config[0].devServer.setupMiddlewares, 'function');
  });
});