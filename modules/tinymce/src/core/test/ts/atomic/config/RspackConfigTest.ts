import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

describe('atomic.tinymce.core.config.RspackConfigTest', () => {
  let rspackConfig: any;
  let path: any;
  let fs: any;

  // Load the rspack config and its dependencies
  const loadConfig = () => {
    // Since we're in a TypeScript test but testing a JS file, we need to require it
    const configPath = '../../../../../../rspack.config.js';
    try {
      // Clear cache to ensure fresh load
      delete require.cache[require.resolve(configPath)];
      rspackConfig = require(configPath);
      path = require('path');
      fs = require('fs');
      return true;
    } catch (e) {
      return false;
    }
  };

  it('should load rspack configuration successfully', () => {
    const loaded = loadConfig();
    assert.isTrue(loaded, 'rspack.config.js should load without errors');
  });

  it('should export an array of configurations', () => {
    loadConfig();
    assert.isArray(rspackConfig, 'Config should be an array');
    assert.isAtLeast(rspackConfig.length, 1, 'Config array should have at least one configuration');
  });

  it('should have proper mode set to development', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      assert.equal(config.mode, 'development', `Config ${index} should have mode set to development`);
    });
  });

  it('should have devtool configured for source maps', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      assert.equal(config.devtool, 'inline-source-map', `Config ${index} should have devtool set to inline-source-map`);
    });
  });

  it('should have target set to web', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      assert.equal(config.target, 'web', `Config ${index} should have target set to web`);
    });
  });

  it('should have resolve extensions configured', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      assert.isArray(config.resolve.extensions, `Config ${index} should have resolve.extensions as array`);
      assert.include(config.resolve.extensions, '.ts', `Config ${index} should resolve .ts files`);
      assert.include(config.resolve.extensions, '.js', `Config ${index} should resolve .js files`);
    });
  });

  it('should have module rules configured', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      assert.isArray(config.module.rules, `Config ${index} should have module.rules as array`);
      assert.isAtLeast(config.module.rules.length, 1, `Config ${index} should have at least one rule`);
    });
  });

  it('should have TypeScript loader rule configured', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('.ts')
      );
      assert.isDefined(tsRule, `Config ${index} should have a TypeScript rule`);
      assert.isArray(tsRule.use, `TypeScript rule in config ${index} should have 'use' as array`);
    });
  });

  it('should have builtin:swc-loader configured for TypeScript', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('.ts')
      );

      if (tsRule && tsRule.use) {
        const swcLoader = tsRule.use.find((loader: any) =>
          loader.loader === 'builtin:swc-loader'
        );
        assert.isDefined(swcLoader, `Config ${index} should have builtin:swc-loader for TypeScript`);
      }
    });
  });

  it('should have JSC parser configuration with TypeScript syntax', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('.ts')
      );

      if (tsRule && tsRule.use) {
        const swcLoader = tsRule.use.find((loader: any) =>
          loader.loader === 'builtin:swc-loader'
        );

        if (swcLoader && swcLoader.options) {
          assert.isDefined(swcLoader.options.jsc, `Config ${index} swc-loader should have jsc option`);
          assert.isDefined(swcLoader.options.jsc.parser, `Config ${index} swc-loader should have jsc.parser option`);
          assert.equal(
            swcLoader.options.jsc.parser.syntax,
            'typescript',
            `Config ${index} swc-loader parser syntax should be 'typescript'`
          );
        }
      }
    });
  });

  it('should have JSC target set to es2022', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('.ts')
      );

      if (tsRule && tsRule.use) {
        const swcLoader = tsRule.use.find((loader: any) =>
          loader.loader === 'builtin:swc-loader'
        );

        if (swcLoader && swcLoader.options && swcLoader.options.jsc) {
          assert.equal(
            swcLoader.options.jsc.target,
            'es2022',
            `Config ${index} swc-loader jsc.target should be 'es2022'`
          );
        }
      }
    });
  });

  it('should have sourceMaps enabled in swc-loader', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('.ts')
      );

      if (tsRule && tsRule.use) {
        const swcLoader = tsRule.use.find((loader: any) =>
          loader.loader === 'builtin:swc-loader'
        );

        if (swcLoader && swcLoader.options) {
          assert.isTrue(
            swcLoader.options.sourceMaps,
            `Config ${index} swc-loader should have sourceMaps enabled`
          );
        }
      }
    });
  });

  it('should have string-replace-loader configured before swc-loader', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('.ts')
      );

      if (tsRule && tsRule.use) {
        const loaderNames = tsRule.use.map((loader: any) => loader.loader);
        const replaceIndex = loaderNames.indexOf('string-replace-loader');
        const swcIndex = loaderNames.indexOf('builtin:swc-loader');

        if (replaceIndex !== -1 && swcIndex !== -1) {
          assert.isTrue(
            replaceIndex < swcIndex,
            `Config ${index}: string-replace-loader should come before swc-loader in the loader chain`
          );
        }
      }
    });
  });

  it('should have JavaScript file rules configured', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      const jsRules = config.module.rules.filter((rule: any) =>
        rule.test && rule.test.toString().includes('.js')
      );
      assert.isAtLeast(jsRules.length, 1, `Config ${index} should have at least one JavaScript rule`);
    });
  });

  it('should have source-map-loader configured for JS files', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      const sourceMapRule = config.module.rules.find((rule: any) =>
        rule.use && rule.use.includes && rule.use.includes('source-map-loader')
      );
      assert.isDefined(sourceMapRule, `Config ${index} should have source-map-loader configured`);
    });
  });

  it('should have SVG file handling configured', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      const svgRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('.svg')
      );
      assert.isDefined(svgRule, `Config ${index} should have SVG rule configured`);
    });
  });

  it('should have optimization settings configured', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      assert.isDefined(config.optimization, `Config ${index} should have optimization settings`);
      assert.isFalse(config.optimization.removeAvailableModules, `Config ${index} should have removeAvailableModules disabled`);
      assert.isFalse(config.optimization.removeEmptyChunks, `Config ${index} should have removeEmptyChunks disabled`);
      assert.isFalse(config.optimization.splitChunks, `Config ${index} should have splitChunks disabled`);
    });
  });

  it('should have watch options configured', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      assert.isDefined(config.watchOptions, `Config ${index} should have watchOptions`);
      assert.isArray(config.watchOptions.ignored, `Config ${index} watchOptions.ignored should be an array`);
    });
  });

  it('should ignore node_modules in watch options', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      const ignoredPatterns = config.watchOptions.ignored;
      const ignoresNodeModules = ignoredPatterns.some((pattern: string) =>
        pattern.includes('node_modules')
      );
      assert.isTrue(ignoresNodeModules, `Config ${index} should ignore node_modules in watch options`);
    });
  });

  it('should have output configuration', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      assert.isDefined(config.output, `Config ${index} should have output configuration`);
      assert.isDefined(config.output.filename, `Config ${index} should have output.filename`);
      assert.isDefined(config.output.path, `Config ${index} should have output.path`);
      assert.isDefined(config.output.publicPath, `Config ${index} should have output.publicPath`);
    });
  });

  it('should have entry points configured', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      assert.isDefined(config.entry, `Config ${index} should have entry points`);
      assert.isObject(config.entry, `Config ${index} entry should be an object`);
      assert.isAtLeast(Object.keys(config.entry).length, 1, `Config ${index} should have at least one entry point`);
    });
  });

  it('should have plugins configured', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      assert.isDefined(config.plugins, `Config ${index} should have plugins`);
      assert.isArray(config.plugins, `Config ${index} plugins should be an array`);
    });
  });

  it('should have TsCheckerRspackPlugin configured', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      const hasTsChecker = config.plugins.some((plugin: any) =>
        plugin.constructor.name === 'TsCheckerRspackPlugin'
      );
      assert.isTrue(hasTsChecker, `Config ${index} should have TsCheckerRspackPlugin`);
    });
  });

  it('should have infrastructure logging configured', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      assert.isDefined(config.infrastructureLogging, `Config ${index} should have infrastructureLogging`);
      assert.equal(config.infrastructureLogging.level, 'log', `Config ${index} should have log level set`);
    });
  });

  it('should have ignore warnings configured', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      assert.isDefined(config.ignoreWarnings, `Config ${index} should have ignoreWarnings`);
      assert.isArray(config.ignoreWarnings, `Config ${index} ignoreWarnings should be an array`);
    });
  });

  it('should have stats configuration', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      assert.isDefined(config.stats, `Config ${index} should have stats configuration`);
      assert.equal(config.stats.logging, 'verbose', `Config ${index} should have verbose logging`);
    });
  });

  it('first config should have devServer configuration', () => {
    loadConfig();
    if (rspackConfig.length > 0) {
      assert.isDefined(rspackConfig[0].devServer, 'First config should have devServer');
      assert.equal(rspackConfig[0].devServer.port, '3000', 'devServer port should be 3000');
      assert.equal(rspackConfig[0].devServer.host, '0.0.0.0', 'devServer host should be 0.0.0.0');
    }
  });

  it('should have alias configuration in resolve', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      assert.isDefined(config.resolve.alias, `Config ${index} should have alias configuration`);
      assert.isObject(config.resolve.alias, `Config ${index} alias should be an object`);
    });
  });

  it('should have tsConfig with references set to auto', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      assert.isDefined(config.resolve.tsConfig, `Config ${index} should have tsConfig in resolve`);
      assert.equal(config.resolve.tsConfig.references, 'auto', `Config ${index} should have tsConfig.references set to auto`);
    });
  });

  it('swc-loader options should be a valid object structure', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('.ts')
      );

      if (tsRule && tsRule.use) {
        const swcLoader = tsRule.use.find((loader: any) =>
          loader.loader === 'builtin:swc-loader'
        );

        if (swcLoader) {
          assert.isObject(swcLoader.options, `Config ${index} swc-loader options should be an object`);
          assert.isObject(swcLoader.options.jsc, `Config ${index} swc-loader jsc should be an object`);
          assert.isObject(swcLoader.options.jsc.parser, `Config ${index} swc-loader jsc.parser should be an object`);
        }
      }
    });
  });

  it('should validate JSC parser syntax is a string', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('.ts')
      );

      if (tsRule && tsRule.use) {
        const swcLoader = tsRule.use.find((loader: any) =>
          loader.loader === 'builtin:swc-loader'
        );

        if (swcLoader && swcLoader.options && swcLoader.options.jsc && swcLoader.options.jsc.parser) {
          assert.isString(
            swcLoader.options.jsc.parser.syntax,
            `Config ${index} jsc.parser.syntax should be a string`
          );
        }
      }
    });
  });

  it('should validate JSC target is a string', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('.ts')
      );

      if (tsRule && tsRule.use) {
        const swcLoader = tsRule.use.find((loader: any) =>
          loader.loader === 'builtin:swc-loader'
        );

        if (swcLoader && swcLoader.options && swcLoader.options.jsc) {
          assert.isString(
            swcLoader.options.jsc.target,
            `Config ${index} jsc.target should be a string`
          );
        }
      }
    });
  });

  it('should have context set to module directory', () => {
    loadConfig();
    rspackConfig.forEach((config: any, index: number) => {
      assert.isDefined(config.context, `Config ${index} should have context defined`);
      assert.isString(config.context, `Config ${index} context should be a string`);
    });
  });
});
describe('Additional Comprehensive Configuration Tests', () => {
  describe('Deep configuration validation', () => {
    it('should validate complete loader configuration structure', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        assert.isDefined(cfg.module, `Config ${index} should have module`);
        assert.isDefined(cfg.module.rules, `Config ${index} should have rules`);
        assert.isArray(cfg.module.rules, `Config ${index} rules should be array`);
        
        cfg.module.rules.forEach((rule: any, ruleIndex: number) => {
          assert.isDefined(rule.test || rule.resourceQuery, 
            `Config ${index} rule ${ruleIndex} should have test or resourceQuery`);
        });
      });
    });

    it('should validate all loader options are objects', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        cfg.module.rules.forEach((rule: any) => {
          if (rule.use && Array.isArray(rule.use)) {
            rule.use.forEach((loader: any) => {
              if (loader.options) {
                assert.isObject(loader.options, 'loader options should be object');
              }
            });
          }
        });
      });
    });

    it('should have consistent mode across all configs', () => {
      loadConfig();
      const modes = rspackConfig.map((cfg: any) => cfg.mode);
      const uniqueModes = [...new Set(modes)];
      assert.strictEqual(uniqueModes.length, 1, 'all configs should have same mode');
      assert.strictEqual(uniqueModes[0], 'development');
    });
  });

  describe('Loader test pattern validation', () => {
    it('should have TypeScript rule that matches .ts files', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        const tsRule = cfg.module.rules.find((rule: any) => 
          rule.test && rule.test.toString().includes('.ts')
        );
        assert.isDefined(tsRule, `Config ${index} should have TypeScript rule`);
        assert.ok(tsRule.test.test('component.ts'), 'should match .ts files');
        assert.ok(!tsRule.test.test('component.tsx'), 'should not match .tsx by default');
      });
    });

    it('should have JavaScript rule that only matches .js files', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        const jsRule = cfg.module.rules.find((rule: any) => 
          rule.test && rule.test.toString().includes('.js') && 
          !rule.test.toString().includes('mjs')
        );
        if (jsRule) {
          assert.ok(jsRule.test.test('module.js'), 'should match .js files');
          assert.ok(!jsRule.test.test('module.mjs'), 'should not match .mjs in js-only rule');
        }
      });
    });

    it('should have source-map rule for both js and mjs', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        const sourceMapRule = cfg.module.rules.find((rule: any) => 
          rule.test && (rule.test.toString().includes('.js') || rule.test.toString().includes('mjs'))
          && rule.use && rule.use.includes('source-map-loader')
        );
        if (sourceMapRule) {
          assert.ok(sourceMapRule.test.test('file.js'), 'should match .js files');
          assert.ok(sourceMapRule.test.test('file.mjs'), 'should match .mjs files');
        }
      });
    });
  });

  describe('SWC loader configuration completeness', () => {
    it('should have all required JSC configuration fields', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        const tsRule = cfg.module.rules.find((rule: any) => 
          rule.test && rule.test.toString().includes('.ts')
        );

        if (tsRule && tsRule.use) {
          const swcLoader = tsRule.use.find((loader: any) => 
            loader.loader === 'builtin:swc-loader'
          );

          if (swcLoader && swcLoader.options && swcLoader.options.jsc) {
            const requiredFields = ['parser', 'target'];
            requiredFields.forEach(field => {
              assert.isDefined(swcLoader.options.jsc[field], 
                `Config ${index} should have jsc.${field}`);
            });
          }
        }
      });
    });

    it('should validate parser has syntax field', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        const tsRule = cfg.module.rules.find((rule: any) => 
          rule.test && rule.test.toString().includes('.ts')
        );

        if (tsRule && tsRule.use) {
          const swcLoader = tsRule.use.find((loader: any) => 
            loader.loader === 'builtin:swc-loader'
          );

          if (swcLoader?.options?.jsc?.parser) {
            assert.isDefined(swcLoader.options.jsc.parser.syntax, 
              `Config ${index} parser should have syntax field`);
          }
        }
      });
    });

    it('should not have conflicting parser configurations', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        const tsRule = cfg.module.rules.find((rule: any) => 
          rule.test && rule.test.toString().includes('.ts')
        );

        if (tsRule && tsRule.use) {
          const swcLoader = tsRule.use.find((loader: any) => 
            loader.loader === 'builtin:swc-loader'
          );

          if (swcLoader && swcLoader.options) {
            // Should not have both old-style and new-style config
            const hasOldStyle = swcLoader.options.syntax !== undefined;
            const hasNewStyle = swcLoader.options.jsc?.parser?.syntax !== undefined;
            
            if (hasNewStyle) {
              assert.strictEqual(hasOldStyle, false, 
                `Config ${index} should not mix old and new parser config`);
            }
          }
        }
      });
    });
  });

  describe('Resolve configuration completeness', () => {
    it('should have both extensions defined', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        assert.isDefined(cfg.resolve.extensions, `Config ${index} should have extensions`);
        assert.isAtLeast(cfg.resolve.extensions.length, 2, 
          `Config ${index} should have at least 2 extensions`);
      });
    });

    it('should prioritize TypeScript over JavaScript', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        const tsIndex = cfg.resolve.extensions.indexOf('.ts');
        const jsIndex = cfg.resolve.extensions.indexOf('.js');
        assert.ok(tsIndex < jsIndex, 
          `Config ${index} should prioritize .ts over .js`);
      });
    });

    it('should have tsConfig references set correctly', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        if (cfg.resolve.tsConfig) {
          assert.equal(cfg.resolve.tsConfig.references, 'auto',
            `Config ${index} should have auto references`);
        }
      });
    });
  });

  describe('Output configuration edge cases', () => {
    it('should use dynamic filename placeholder', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        assert.equal(cfg.output.filename, '[name]',
          `Config ${index} should use [name] placeholder`);
        assert.ok(cfg.output.filename.includes('['), 'should use dynamic placeholder');
      });
    });

    it('should have absolute output path', () => {
      loadConfig();
      const path = require('path');
      rspackConfig.forEach((cfg: any, index: number) => {
        assert.ok(path.isAbsolute(cfg.output.path),
          `Config ${index} output.path should be absolute`);
      });
    });
  });

  describe('Plugin configuration validation', () => {
    it('should have plugins array', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        assert.isArray(cfg.plugins, `Config ${index} plugins should be array`);
        assert.ok(cfg.plugins.length > 0, `Config ${index} should have plugins`);
      });
    });

    it('should have TypeScript checker plugin', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        const hasTsChecker = cfg.plugins.some((plugin: any) => 
          plugin.constructor.name.includes('TsChecker') ||
          plugin.constructor.name.includes('TypeScript')
        );
        assert.ok(hasTsChecker, `Config ${index} should have TS checker`);
      });
    });
  });

  describe('Stats and logging configuration', () => {
    it('should have verbose logging for development', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        assert.equal(cfg.stats.logging, 'verbose',
          `Config ${index} should have verbose logging`);
      });
    });

    it('should hide assets in stats', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        assert.strictEqual(cfg.stats.assets, false,
          `Config ${index} should hide assets`);
      });
    });

    it('should have infrastructure logging', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        assert.isDefined(cfg.infrastructureLogging,
          `Config ${index} should have infrastructure logging`);
        assert.equal(cfg.infrastructureLogging.level, 'log');
      });
    });
  });

  describe('Watch options validation', () => {
    it('should ignore node_modules in all configs', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        const ignored = cfg.watchOptions.ignored;
        const ignoresNodeModules = ignored.some((pattern: string) =>
          pattern.includes('node_modules')
        );
        assert.ok(ignoresNodeModules,
          `Config ${index} should ignore node_modules`);
      });
    });

    it('should have ignored patterns as array', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        assert.isArray(cfg.watchOptions.ignored,
          `Config ${index} ignored should be array`);
      });
    });
  });

  describe('Dev server configuration edge cases', () => {
    it('should have numeric or string port', () => {
      loadConfig();
      if (rspackConfig[0].devServer) {
        const port = rspackConfig[0].devServer.port;
        assert.ok(typeof port === 'string' || typeof port === 'number',
          'port should be string or number');
      }
    });

    it('should have client overlay for errors and warnings', () => {
      loadConfig();
      if (rspackConfig[0].devServer) {
        assert.isDefined(rspackConfig[0].devServer.client);
        assert.isDefined(rspackConfig[0].devServer.client.overlay);
        assert.strictEqual(rspackConfig[0].devServer.client.overlay.errors, true);
        assert.strictEqual(rspackConfig[0].devServer.client.overlay.warnings, true);
      }
    });

    it('should have static file serving configured', () => {
      loadConfig();
      if (rspackConfig[0].devServer) {
        assert.isDefined(rspackConfig[0].devServer.static);
        assert.equal(rspackConfig[0].devServer.static.publicPath, '/');
      }
    });
  });

  describe('Entry points validation', () => {
    it('should have at least one entry in each config', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        const entryCount = Object.keys(cfg.entry).length;
        assert.ok(entryCount > 0, `Config ${index} should have entries`);
      });
    });

    it('should have core tinymce entry in production config', () => {
      loadConfig();
      if (rspackConfig.length > 1) {
        const productionConfig = rspackConfig[1];
        const hasCoreEntry = Object.keys(productionConfig.entry).some(key =>
          key.includes('tinymce.js')
        );
        assert.ok(hasCoreEntry, 'Production config should have core entry');
      }
    });
  });

  describe('Optimization settings validation', () => {
    it('should disable chunk optimization for development', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        assert.strictEqual(cfg.optimization.removeAvailableModules, false);
        assert.strictEqual(cfg.optimization.removeEmptyChunks, false);
        assert.strictEqual(cfg.optimization.splitChunks, false);
      });
    });
  });

  describe('Context and target validation', () => {
    it('should have web target for all configs', () => {
      loadConfig();
      rspackConfig.forEach((cfg: any, index: number) => {
        assert.equal(cfg.target, 'web', `Config ${index} should target web`);
      });
    });

    it('should have valid context directory', () => {
      loadConfig();
      const path = require('path');
      rspackConfig.forEach((cfg: any, index: number) => {
        assert.ok(path.isAbsolute(cfg.context),
          `Config ${index} context should be absolute`);
      });
    });
  });
});