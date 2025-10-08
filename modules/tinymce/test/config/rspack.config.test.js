/**
 * Unit tests for rspack.config.js
 * 
 * These tests validate the Rspack configuration structure and ensure
 * that the SWC loader is correctly configured with TypeScript parsing.
 */

const { expect } = require('chai');
const path = require('path');

describe('rspack.config.js', () => {
  let config;
  let rspackConfigPath;

  before(() => {
    rspackConfigPath = path.resolve(__dirname, '../../rspack.config.js');

    // Load the configuration
    config = require(rspackConfigPath);
  });

  describe('Configuration Structure', () => {
    it('should export an array of configurations', () => {
      expect(config).to.be.an('array');
      expect(config).to.have.length.at.least(1);
    });

    it('should have valid configuration objects', () => {
      config.forEach((cfg, index) => {
        expect(cfg, `Config at index ${index} should be an object`).to.be.an('object');
        expect(cfg, `Config at index ${index} should have entry`).to.have.property('entry');
        expect(cfg, `Config at index ${index} should have output`).to.have.property('output');
        expect(cfg, `Config at index ${index} should have module`).to.have.property('module');
      });
    });

    it('should set mode to development', () => {
      config.forEach((cfg, index) => {
        expect(cfg.mode, `Config at index ${index} mode`).to.equal('development');
      });
    });

    it('should enable source maps', () => {
      config.forEach((cfg, index) => {
        expect(cfg.devtool, `Config at index ${index} devtool`).to.equal('inline-source-map');
      });
    });

    it('should target web platform', () => {
      config.forEach((cfg, index) => {
        expect(cfg.target, `Config at index ${index} target`).to.equal('web');
      });
    });
  });

  describe('Module Rules', () => {
    let tsRule;

    beforeEach(() => {
      // Find the TypeScript rule in the first config
      tsRule = config[0].module.rules.find(rule => 
        rule.test && rule.test.toString().includes('.ts')
      );
    });

    it('should have a rule for TypeScript files', () => {
      expect(tsRule, 'TypeScript rule should exist').to.exist;
      expect(tsRule.test, 'TypeScript rule test regex').to.be.a('RegExp');
    });

    it('should use multiple loaders for TypeScript', () => {
      expect(tsRule.use, 'TypeScript rule should use loaders').to.be.an('array');
      expect(tsRule.use.length, 'Should have at least 2 loaders').to.be.at.least(2);
    });

    it('should include string-replace-loader for version replacement', () => {
      const stringReplaceLoader = tsRule.use.find(loader => 
        loader.loader === 'string-replace-loader'
      );
      
      expect(stringReplaceLoader, 'string-replace-loader should exist').to.exist;
      expect(stringReplaceLoader.options, 'string-replace-loader options').to.exist;
      expect(stringReplaceLoader.options.multiple, 'string-replace-loader multiple replacements').to.be.an('array');
    });

    it('should include builtin:swc-loader for TypeScript compilation', () => {
      const swcLoader = tsRule.use.find(loader => 
        loader.loader === 'builtin:swc-loader'
      );
      
      expect(swcLoader, 'SWC loader should exist').to.exist;
      expect(swcLoader.options, 'SWC loader options').to.exist;
    });
  });

  describe('SWC Loader Configuration (TINY-12824)', () => {
    let swcLoader;

    beforeEach(() => {
      const tsRule = config[0].module.rules.find(rule => 
        rule.test && rule.test.toString().includes('.ts')
      );
      swcLoader = tsRule.use.find(loader => 
        loader.loader === 'builtin:swc-loader'
      );
    });

    it('should have JSC configuration object', () => {
      expect(swcLoader.options, 'SWC options should exist').to.exist;
      expect(swcLoader.options.jsc, 'JSC configuration should exist').to.exist;
      expect(swcLoader.options.jsc, 'JSC should be an object').to.be.an('object');
    });

    it('should configure parser with TypeScript syntax', () => {
      expect(swcLoader.options.jsc.parser, 'JSC parser should exist').to.exist;
      expect(swcLoader.options.jsc.parser, 'Parser should be an object').to.be.an('object');
      expect(swcLoader.options.jsc.parser.syntax, 'Parser syntax').to.equal('typescript');
    });

    it('should set target to ES2022', () => {
      expect(swcLoader.options.jsc.target, 'JSC target').to.equal('es2022');
    });

    it('should enable source maps', () => {
      expect(swcLoader.options.sourceMaps, 'Source maps should be enabled').to.be.true;
    });

    it('should have all required SWC options properties', () => {
      const requiredProps = ['jsc', 'sourceMaps'];
      requiredProps.forEach(prop => {
        expect(swcLoader.options, `SWC options should have ${prop}`).to.have.property(prop);
      });
    });
  });

  describe('Resolve Configuration', () => {
    it('should resolve TypeScript and JavaScript extensions', () => {
      config.forEach((cfg, index) => {
        expect(cfg.resolve, `Config ${index} should have resolve`).to.exist;
        expect(cfg.resolve.extensions, `Config ${index} extensions`).to.be.an('array');
        expect(cfg.resolve.extensions).to.include('.ts');
        expect(cfg.resolve.extensions).to.include('.js');
      });
    });

    it('should configure TypeScript config file resolution', () => {
      config.forEach((cfg, index) => {
        expect(cfg.resolve.tsConfig, `Config ${index} tsConfig`).to.exist;
        expect(cfg.resolve.tsConfig.configFile, `Config ${index} configFile`).to.be.a('string');
        expect(cfg.resolve.tsConfig.references, `Config ${index} references`).to.equal('auto');
      });
    });

    it('should have module aliases configured', () => {
      config.forEach((cfg, index) => {
        expect(cfg.resolve.alias, `Config ${index} should have aliases`).to.exist;
        expect(cfg.resolve.alias, `Config ${index} aliases should be an object`).to.be.an('object');
      });
    });
  });

  describe('Output Configuration', () => {
    it('should configure output paths correctly', () => {
      config.forEach((cfg, index) => {
        expect(cfg.output, `Config ${index} output`).to.exist;
        expect(cfg.output.filename, `Config ${index} filename pattern`).to.equal('[name]');
        expect(cfg.output.publicPath, `Config ${index} publicPath`).to.equal('/');
        expect(cfg.output.path, `Config ${index} output path`).to.be.a('string');
      });
    });
  });

  describe('Optimization Configuration', () => {
    it('should disable certain optimizations for development', () => {
      config.forEach((cfg, index) => {
        expect(cfg.optimization, `Config ${index} optimization`).to.exist;
        expect(cfg.optimization.removeAvailableModules, `Config ${index} removeAvailableModules`).to.be.false;
        expect(cfg.optimization.removeEmptyChunks, `Config ${index} removeEmptyChunks`).to.be.false;
        expect(cfg.optimization.splitChunks, `Config ${index} splitChunks`).to.be.false;
      });
    });
  });

  describe('Dev Server Configuration', () => {
    it('should configure dev server on first config only', () => {
      expect(config[0].devServer, 'First config should have devServer').to.exist;
      expect(config[0].devServer.port, 'Dev server port').to.equal('3000');
      expect(config[0].devServer.host, 'Dev server host').to.equal('0.0.0.0');
      expect(config[0].devServer.allowedHosts, 'Allowed hosts').to.equal('all');
    });

    it('should disable hot reload and live reload', () => {
      expect(config[0].devServer.hot, 'Hot reload').to.be.false;
      expect(config[0].devServer.liveReload, 'Live reload').to.be.false;
    });

    it('should configure static file serving', () => {
      expect(config[0].devServer.static, 'Static config').to.exist;
      expect(config[0].devServer.static.publicPath, 'Static publicPath').to.equal('/');
      expect(config[0].devServer.static.directory, 'Static directory').to.be.a('string');
    });

    it('should have setup middlewares function', () => {
      expect(config[0].devServer.setupMiddlewares, 'setupMiddlewares').to.be.a('function');
    });
  });

  describe('Watch Options', () => {
    it('should ignore node_modules in watch', () => {
      config.forEach((cfg, index) => {
        expect(cfg.watchOptions, `Config ${index} watchOptions`).to.exist;
        expect(cfg.watchOptions.ignored, `Config ${index} ignored patterns`).to.be.an('array');
        expect(cfg.watchOptions.ignored).to.include('**/node_modules/**');
      });
    });
  });

  describe('Plugins Configuration', () => {
    it('should have TsCheckerRspackPlugin', () => {
      config.forEach((cfg, index) => {
        expect(cfg.plugins, `Config ${index} plugins`).to.be.an('array');
        expect(cfg.plugins.length, `Config ${index} should have plugins`).to.be.at.least(1);
        
        const hasTsChecker = cfg.plugins.some(plugin => 
          plugin && plugin.constructor.name === 'TsCheckerRspackPlugin'
        );
        expect(hasTsChecker, `Config ${index} should have TsCheckerRspackPlugin`).to.be.true;
      });
    });
  });

  describe('JavaScript File Rules', () => {
    it('should handle JavaScript files with source maps', () => {
      const jsSourceMapRule = config[0].module.rules.find(rule => 
        rule.test && rule.test.toString().includes('js|mjs') && 
        rule.use && rule.use.includes('source-map-loader')
      );
      
      expect(jsSourceMapRule, 'JS source map rule should exist').to.exist;
      expect(jsSourceMapRule.enforce, 'Should enforce as pre-loader').to.equal('pre');
    });

    it('should resolve JavaScript files without full specification', () => {
      const jsResolveRule = config[0].module.rules.find(rule => 
        rule.test && rule.test.toString().includes('.js') &&
        rule.resolve && rule.resolve.fullySpecified === false
      );
      
      expect(jsResolveRule, 'JS resolve rule should exist').to.exist;
    });
  });

  describe('Asset Rules', () => {
    it('should handle SVG files as source assets', () => {
      const svgRule = config[0].module.rules.find(rule => 
        rule.test && rule.test.toString().includes('.svg')
      );
      
      expect(svgRule, 'SVG rule should exist').to.exist;
      expect(svgRule.type, 'SVG type').to.equal('asset/source');
    });

    it('should handle raw query parameter files', () => {
      const rawRule = config[0].module.rules.find(rule => 
        rule.resourceQuery && rule.resourceQuery.toString().includes('raw')
      );
      
      expect(rawRule, 'Raw resource rule should exist').to.exist;
      expect(rawRule.type, 'Raw resource type').to.equal('asset/source');
    });
  });

  describe('Entry Points', () => {
    it('should have core demo entry point', () => {
      const firstConfig = config[0];
      const hasCoreDemoEntry = Object.keys(firstConfig.entry).some(key => 
        key.includes('core') && key.includes('demo')
      );
      expect(hasCoreDemoEntry, 'Should have core demo entry').to.be.true;
    });

    it('should have main tinymce entry point in second config', () => {
      if (config.length > 1) {
        const secondConfig = config[1];
        expect(secondConfig.entry, 'Second config entry').to.have.property('js/tinymce/tinymce.js');
      }
    });

    it('should have plugin entries', () => {
      const firstConfig = config[0];
      const hasPluginEntries = Object.keys(firstConfig.entry).some(key => 
        key.includes('plugins')
      );
      expect(hasPluginEntries, 'Should have plugin entries').to.be.true;
    });

    it('should have theme entries', () => {
      const firstConfig = config[0];
      const hasThemeEntries = Object.keys(firstConfig.entry).some(key => 
        key.includes('themes')
      );
      expect(hasThemeEntries, 'Should have theme entries').to.be.true;
    });
  });

  describe('Infrastructure Logging', () => {
    it('should set logging level to log', () => {
      config.forEach((cfg, index) => {
        expect(cfg.infrastructureLogging, `Config ${index} infrastructureLogging`).to.exist;
        expect(cfg.infrastructureLogging.level, `Config ${index} logging level`).to.equal('log');
      });
    });
  });

  describe('Ignored Warnings', () => {
    it('should ignore export not found warnings', () => {
      config.forEach((cfg, index) => {
        expect(cfg.ignoreWarnings, `Config ${index} ignoreWarnings`).to.be.an('array');
        expect(cfg.ignoreWarnings.length, `Config ${index} should have warning patterns`).to.be.at.least(1);
        
        const hasExportWarning = cfg.ignoreWarnings.some(pattern => 
          pattern.toString().includes('export')
        );
        expect(hasExportWarning, `Config ${index} should ignore export warnings`).to.be.true;
      });
    });
  });

  describe('Statistics Configuration', () => {
    it('should configure verbose logging with minimal output', () => {
      config.forEach((cfg, index) => {
        expect(cfg.stats, `Config ${index} stats`).to.exist;
        expect(cfg.stats.logging, `Config ${index} stats logging`).to.equal('verbose');
        expect(cfg.stats.assets, `Config ${index} stats assets`).to.be.false;
        expect(cfg.stats.modulesSpace, `Config ${index} stats modulesSpace`).to.equal(5);
      });
    });
  });

  describe('TypeScript Compilation Target Validation', () => {
    let swcLoader;

    before(() => {
      const tsRule = config[0].module.rules.find(rule => 
        rule.test && rule.test.toString().includes('.ts')
      );
      swcLoader = tsRule.use.find(loader => 
        loader.loader === 'builtin:swc-loader'
      );
    });

    it('should use a modern ES target for better performance', () => {
      const target = swcLoader.options.jsc.target;
      const modernTargets = ['es2020', 'es2021', 'es2022', 'es2023', 'esnext'];
      expect(modernTargets, 'Target should be modern ES version').to.include(target);
    });

    it('should have consistent target across all TypeScript compilations', () => {
      const allTargets = config.map(cfg => {
        const tsRule = cfg.module.rules.find(rule => 
          rule.test && rule.test.toString().includes('.ts')
        );
        if (tsRule && tsRule.use) {
          const swc = tsRule.use.find(loader => 
            loader.loader === 'builtin:swc-loader'
          );
          return swc ? swc.options.jsc.target : null;
        }
        return null;
      }).filter(Boolean);

      if (allTargets.length > 1) {
        const firstTarget = allTargets[0];
        allTargets.forEach((target, index) => {
          expect(target, `Target at config ${index} should be consistent`).to.equal(firstTarget);
        });
      }
    });
  });

  describe('Parser Syntax Validation', () => {
    it('should use typescript parser syntax for .ts files', () => {
      const tsRule = config[0].module.rules.find(rule => 
        rule.test && rule.test.toString().includes('.ts')
      );
      const swcLoader = tsRule.use.find(loader => 
        loader.loader === 'builtin:swc-loader'
      );

      expect(swcLoader.options.jsc.parser.syntax, 'Parser syntax must be typescript').to.equal('typescript');
    });

    it('should not have conflicting parser options', () => {
      const tsRule = config[0].module.rules.find(rule => 
        rule.test && rule.test.toString().includes('.ts')
      );
      const swcLoader = tsRule.use.find(loader => 
        loader.loader === 'builtin:swc-loader'
      );

      const parser = swcLoader.options.jsc.parser;
      
      // TSX should not be enabled for .ts files (only for .tsx)
      if (parser.tsx !== undefined) {
        expect(parser.tsx, 'TSX should not be enabled for .ts files').to.be.false;
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing optional properties gracefully', () => {
      // Test that required properties exist
      expect(() => {
        config.forEach(cfg => {
          expect(cfg.entry, 'entry is required').to.exist;
          expect(cfg.module, 'module is required').to.exist;
          expect(cfg.output, 'output is required').to.exist;
        });
      }).to.not.throw();
    });

    it('should have valid file paths for entry points', () => {
      config.forEach(cfg => {
        Object.values(cfg.entry).forEach(entryPath => {
          expect(entryPath, 'Entry path should be a string').to.be.a('string');
          expect(entryPath.length, 'Entry path should not be empty').to.be.greaterThan(0);
        });
      });
    });

    it('should have valid regex patterns in rules', () => {
      config.forEach(cfg => {
        cfg.module.rules.forEach(rule => {
          if (rule.test) {
            expect(rule.test, 'Rule test should be a RegExp').to.be.instanceOf(RegExp);
          }
        });
      });
    });
  });

  describe('Configuration Context', () => {
    it('should set context to the tinymce module directory', () => {
      config.forEach((cfg, index) => {
        expect(cfg.context, `Config ${index} context`).to.be.a('string');
        expect(path.isAbsolute(cfg.context), `Config ${index} context should be absolute path`).to.be.true;
      });
    });
  });
});