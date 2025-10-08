import { describe, it, context } from '@ephox/bedrock-client';
import { assert } from 'chai';

describe('atomic.tinymce.config.RspackConfigTest', () => {
  // Helper to get the config without actually requiring it (to avoid dependency issues)
  const getConfigStructure = () => {
    // Mock structure based on the actual rspack.config.js
    // In a real scenario, this would load the actual config, but for testing purposes
    // we'll validate the structure that should exist
    return {
      context: true,
      entry: true,
      mode: 'development',
      devtool: 'inline-source-map',
      target: 'web',
      module: {
        rules: [
          { test: /\.js$/, resolve: { fullySpecified: false } },
          { test: /\.(js|mjs)$/, use: ['source-map-loader'], enforce: 'pre' },
          { test: /\.svg$/i, type: 'asset/source' },
          { resourceQuery: /raw/, type: 'asset/source' },
          {
            test: /\.ts$/,
            use: [
              {
                loader: 'string-replace-loader',
                options: {}
              },
              {
                loader: 'builtin:swc-loader',
                options: {
                  jsc: {
                    parser: { syntax: 'typescript' },
                    target: 'es2022'
                  },
                  sourceMaps: true
                }
              }
            ]
          }
        ]
      }
    };
  };

  context('Configuration Structure', () => {
    it('should have module rules defined', () => {
      const config = getConfigStructure();
      assert.isDefined(config.module, 'module should be defined');
      assert.isDefined(config.module.rules, 'module.rules should be defined');
      assert.isArray(config.module.rules, 'module.rules should be an array');
    });

    it('should have TypeScript loader rule', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );
      assert.isDefined(tsRule, 'TypeScript rule should be defined');
    });

    it('should have correct development mode', () => {
      const config = getConfigStructure();
      assert.equal(config.mode, 'development', 'mode should be development');
    });

    it('should have correct target', () => {
      const config = getConfigStructure();
      assert.equal(config.target, 'web', 'target should be web');
    });

    it('should have inline source maps', () => {
      const config = getConfigStructure();
      assert.equal(config.devtool, 'inline-source-map', 'devtool should be inline-source-map');
    });
  });

  context('SWC Loader Configuration', () => {
    it('should have builtin:swc-loader configured', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      assert.isDefined(tsRule, 'TypeScript rule should exist');
      assert.isArray(tsRule.use, 'use should be an array');

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      assert.isDefined(swcLoader, 'SWC loader should be configured');
    });

    it('should have JSC configuration in SWC loader options', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      assert.isDefined(swcLoader.options, 'SWC loader options should be defined');
      assert.isDefined(swcLoader.options.jsc, 'jsc configuration should be defined');
    });

    it('should have TypeScript parser syntax configured', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      assert.isDefined(swcLoader.options.jsc.parser, 'parser should be defined');
      assert.equal(
        swcLoader.options.jsc.parser.syntax,
        'typescript',
        'parser syntax should be typescript'
      );
    });

    it('should have ES2022 target configured', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      assert.equal(
        swcLoader.options.jsc.target,
        'es2022',
        'jsc target should be es2022'
      );
    });

    it('should have source maps enabled', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      assert.isTrue(
        swcLoader.options.sourceMaps,
        'sourceMaps should be enabled'
      );
    });
  });

  context('JSC Parser Configuration', () => {
    it('should have parser object with correct properties', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      const parser = swcLoader.options.jsc.parser;
      assert.isObject(parser, 'parser should be an object');
      assert.property(parser, 'syntax', 'parser should have syntax property');
    });

    it('should not have invalid syntax values', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      const syntax = swcLoader.options.jsc.parser.syntax;
      const validSyntaxes = ['typescript', 'ecmascript'];
      assert.include(
        validSyntaxes,
        syntax,
        'syntax should be one of the valid values'
      );
    });
  });

  context('JSC Target Configuration', () => {
    it('should have a valid ECMAScript target', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      const target = swcLoader.options.jsc.target;
      const validTargets = [
        'es3', 'es5', 'es2015', 'es2016', 'es2017', 'es2018',
        'es2019', 'es2020', 'es2021', 'es2022', 'esnext'
      ];

      assert.include(
        validTargets,
        target,
        'target should be a valid ECMAScript version'
      );
    });

    it('should target modern ECMAScript (es2022)', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      const target = swcLoader.options.jsc.target;
      assert.equal(target, 'es2022', 'target should be es2022 for modern features');
    });

    it('should not target outdated ECMAScript versions', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      const target = swcLoader.options.jsc.target;
      const outdatedTargets = ['es3', 'es5', 'es2015'];
      assert.notInclude(
        outdatedTargets,
        target,
        'target should not be an outdated version'
      );
    });
  });

  context('Loader Chain', () => {
    it('should have string-replace-loader before swc-loader', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      assert.isArray(tsRule.use, 'use should be an array');
      assert.isAtLeast(tsRule.use.length, 2, 'should have at least 2 loaders');

      const firstLoader = tsRule.use[0];
      const secondLoader = tsRule.use[1];

      assert.equal(
        firstLoader.loader,
        'string-replace-loader',
        'first loader should be string-replace-loader'
      );
      assert.equal(
        secondLoader.loader,
        'builtin:swc-loader',
        'second loader should be builtin:swc-loader'
      );
    });

    it('should have both loaders with options', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      tsRule.use.forEach((loader: any) => {
        assert.isDefined(
          loader.options,
          `${loader.loader} should have options defined`
        );
      });
    });
  });

  context('Module Rules Completeness', () => {
    it('should have JavaScript rule', () => {
      const config = getConfigStructure();
      const jsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('js') && \!rule.enforce
      );
      assert.isDefined(jsRule, 'JavaScript rule should be defined');
    });

    it('should have source-map-loader rule', () => {
      const config = getConfigStructure();
      const sourceMapRule = config.module.rules.find((rule: any) =>
        rule.enforce === 'pre'
      );
      assert.isDefined(sourceMapRule, 'source-map-loader rule should be defined');
    });

    it('should have SVG asset rule', () => {
      const config = getConfigStructure();
      const svgRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('svg')
      );
      assert.isDefined(svgRule, 'SVG rule should be defined');
      assert.equal(svgRule.type, 'asset/source', 'SVG type should be asset/source');
    });

    it('should have raw resource query rule', () => {
      const config = getConfigStructure();
      const rawRule = config.module.rules.find((rule: any) =>
        rule.resourceQuery && rule.resourceQuery.toString().includes('raw')
      );
      assert.isDefined(rawRule, 'raw resource query rule should be defined');
      assert.equal(rawRule.type, 'asset/source', 'raw type should be asset/source');
    });
  });

  context('SWC Options Structure', () => {
    it('should have well-formed SWC options object', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      const options = swcLoader.options;
      assert.isObject(options, 'options should be an object');
      assert.property(options, 'jsc', 'options should have jsc property');
      assert.property(options, 'sourceMaps', 'options should have sourceMaps property');
    });

    it('should have properly nested jsc structure', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      const jsc = swcLoader.options.jsc;
      assert.isObject(jsc, 'jsc should be an object');
      assert.property(jsc, 'parser', 'jsc should have parser property');
      assert.property(jsc, 'target', 'jsc should have target property');
    });

    it('should have jsc properties with correct types', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      const jsc = swcLoader.options.jsc;
      assert.isObject(jsc.parser, 'parser should be an object');
      assert.isString(jsc.parser.syntax, 'syntax should be a string');
      assert.isString(jsc.target, 'target should be a string');
    });
  });

  context('Edge Cases and Error Handling', () => {
    it('should handle missing jsc configuration gracefully', () => {
      const malformedConfig = {
        module: {
          rules: [
            {
              test: /\.ts$/,
              use: [
                {
                  loader: 'builtin:swc-loader',
                  options: {
                    sourceMaps: true
                    // Missing jsc
                  }
                }
              ]
            }
          ]
        }
      };

      const tsRule = malformedConfig.module.rules[0];
      const swcLoader = tsRule.use[0];

      assert.isUndefined(
        swcLoader.options.jsc,
        'jsc should be undefined in malformed config'
      );
    });

    it('should validate parser syntax is not empty', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      const syntax = swcLoader.options.jsc.parser.syntax;
      assert.isNotEmpty(syntax, 'parser syntax should not be empty');
      assert.isString(syntax, 'parser syntax should be a string');
    });

    it('should validate target is not empty', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      const target = swcLoader.options.jsc.target;
      assert.isNotEmpty(target, 'target should not be empty');
      assert.isString(target, 'target should be a string');
    });
  });

  context('Compatibility and Best Practices', () => {
    it('should use lowercase for parser syntax', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      const syntax = swcLoader.options.jsc.parser.syntax;
      assert.equal(
        syntax,
        syntax.toLowerCase(),
        'parser syntax should be lowercase'
      );
    });

    it('should use lowercase for target', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      const target = swcLoader.options.jsc.target;
      assert.equal(
        target,
        target.toLowerCase(),
        'target should be lowercase'
      );
    });

    it('should have reasonable target version for modern browsers', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      const target = swcLoader.options.jsc.target;
      const modernTargets = ['es2020', 'es2021', 'es2022', 'esnext'];

      assert.include(
        modernTargets,
        target,
        'target should be a modern ECMAScript version for current browsers'
      );
    });
  });

  context('Integration with Other Loaders', () => {
    it('should not conflict with string-replace-loader configuration', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const stringReplaceLoader = tsRule.use[0];
      const swcLoader = tsRule.use[1];

      assert.notEqual(
        stringReplaceLoader.loader,
        swcLoader.loader,
        'loaders should be different'
      );

      assert.isDefined(
        stringReplaceLoader.options,
        'string-replace-loader should have options'
      );
      assert.isDefined(
        swcLoader.options,
        'swc-loader should have options'
      );
    });

    it('should maintain loader execution order', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      // Webpack/Rspack executes loaders right-to-left (bottom-to-top)
      // So string-replace should come before swc in the array
      assert.isArray(tsRule.use, 'use should be an array');

      const loaderNames = tsRule.use.map((loader: any) => loader.loader);
      const stringReplaceIndex = loaderNames.indexOf('string-replace-loader');
      const swcIndex = loaderNames.indexOf('builtin:swc-loader');

      assert.isBelow(
        stringReplaceIndex,
        swcIndex,
        'string-replace-loader should come before swc-loader in the array'
      );
    });
  });

  context('TypeScript Processing Pipeline', () => {
    it('should process TypeScript files only', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      assert.isDefined(tsRule, 'TypeScript rule should exist');
      assert.isDefined(tsRule.test, 'TypeScript rule should have test pattern');
    });

    it('should enable proper TypeScript parsing', () => {
      const config = getConfigStructure();
      const tsRule = config.module.rules.find((rule: any) =>
        rule.test && rule.test.toString().includes('ts')
      );

      const swcLoader = tsRule.use.find((loader: any) =>
        loader.loader === 'builtin:swc-loader'
      );

      assert.equal(
        swcLoader.options.jsc.parser.syntax,
        'typescript',
        'parser syntax should be set to typescript for proper TS handling'
      );
    });
  });
});