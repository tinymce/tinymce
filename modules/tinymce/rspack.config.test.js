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