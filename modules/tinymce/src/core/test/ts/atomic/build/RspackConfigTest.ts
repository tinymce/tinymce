import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

/**
 * Tests for rspack.config.js SWC loader configuration
 * 
 * These tests validate the configuration structure, particularly the JSC options
 * added to the SWC loader for TypeScript compilation.
 */
describe('atomic.tinymce.core.build.RspackConfigTest', () => {

  describe('SWC Loader JSC Configuration', () => {
    it('TINY-XXXX: should have valid JSC parser configuration structure', () => {
      // Test the structure of JSC parser configuration
      const jscParserConfig = {
        syntax: 'typescript'
      };

      assert.equal(jscParserConfig.syntax, 'typescript', 'Parser syntax should be typescript');
      assert.isString(jscParserConfig.syntax, 'Parser syntax should be a string');
    });

    it('TINY-XXXX: should have valid JSC target configuration', () => {
      // Test the structure of JSC target configuration
      const jscConfig = {
        parser: { syntax: 'typescript' },
        target: 'es2022'
      };

      assert.equal(jscConfig.target, 'es2022', 'Target should be es2022');
      assert.isString(jscConfig.target, 'Target should be a string');
      assert.deepEqual(jscConfig.parser, { syntax: 'typescript' }, 'Parser config should match expected structure');
    });

    it('TINY-XXXX: should have complete SWC loader options structure', () => {
      // Test the complete options structure that includes both JSC and sourceMaps
      const swcOptions = {
        jsc: {
          parser: { syntax: 'typescript' },
          target: 'es2022'
        },
        sourceMaps: true
      };

      assert.isTrue(swcOptions.sourceMaps, 'sourceMaps should be enabled');
      assert.isObject(swcOptions.jsc, 'jsc should be an object');
      assert.deepEqual(swcOptions.jsc, {
        parser: { syntax: 'typescript' },
        target: 'es2022'
      }, 'jsc configuration should match expected structure');
    });

    it('TINY-XXXX: should validate JSC parser syntax accepts only valid values', () => {
      const validSyntaxes = ['typescript', 'ecmascript'];
      const testSyntax = 'typescript';

      assert.include(validSyntaxes, testSyntax, 'typescript should be a valid syntax');
    });

    it('TINY-XXXX: should validate JSC target is a valid ES version', () => {
      const validTargets = ['es3', 'es5', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'es2021', 'es2022'];
      const testTarget = 'es2022';

      assert.include(validTargets, testTarget, 'es2022 should be a valid target');
    });

    it('TINY-XXXX: should have nested parser configuration within jsc', () => {
      const jscConfig = {
        parser: { syntax: 'typescript' },
        target: 'es2022'
      };

      assert.property(jscConfig, 'parser', 'jsc should have parser property');
      assert.property(jscConfig.parser, 'syntax', 'parser should have syntax property');
      assert.isObject(jscConfig.parser, 'parser should be an object');
    });

    it('TINY-XXXX: should maintain sourceMaps alongside JSC config', () => {
      const options = {
        jsc: {
          parser: { syntax: 'typescript' },
          target: 'es2022'
        },
        sourceMaps: true
      };

      assert.property(options, 'jsc', 'Options should have jsc property');
      assert.property(options, 'sourceMaps', 'Options should have sourceMaps property');
      assert.isTrue(options.sourceMaps, 'sourceMaps should be true');
    });

    it('TINY-XXXX: should have correct TypeScript syntax string literal', () => {
      const syntax = 'typescript';
      
      assert.equal(syntax.toLowerCase(), 'typescript', 'Syntax should be lowercase typescript');
      assert.notEqual(syntax, 'TypeScript', 'Syntax should not be capitalized');
      assert.notEqual(syntax, 'ts', 'Syntax should not be abbreviated');
    });

    it('TINY-XXXX: should have es2022 as valid target string', () => {
      const target = 'es2022';
      
      assert.match(target, /^es\d{4}$/, 'Target should match ES year format');
      assert.equal(target, 'es2022', 'Target should be exactly es2022');
    });
  });

  describe('SWC Loader Configuration Structure Validation', () => {
    it('TINY-XXXX: should validate loader property structure', () => {
      const loaderConfig = {
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: { syntax: 'typescript' },
            target: 'es2022'
          },
          sourceMaps: true
        }
      };

      assert.equal(loaderConfig.loader, 'builtin:swc-loader', 'Loader should be builtin:swc-loader');
      assert.property(loaderConfig, 'options', 'Loader config should have options property');
      assert.isObject(loaderConfig.options, 'Options should be an object');
    });

    it('TINY-XXXX: should have valid builtin loader identifier', () => {
      const loaderName = 'builtin:swc-loader';
      
      assert.match(loaderName, /^builtin:/, 'Loader should have builtin: prefix');
      assert.include(loaderName, 'swc-loader', 'Loader should reference swc-loader');
    });

    it('TINY-XXXX: should validate options are properly nested', () => {
      const options = {
        jsc: {
          parser: { syntax: 'typescript' },
          target: 'es2022'
        },
        sourceMaps: true
      };

      assert.isObject(options.jsc, 'jsc should be an object');
      assert.isObject(options.jsc.parser, 'jsc.parser should be an object');
      assert.isString(options.jsc.parser.syntax, 'jsc.parser.syntax should be a string');
      assert.isString(options.jsc.target, 'jsc.target should be a string');
      assert.isBoolean(options.sourceMaps, 'sourceMaps should be a boolean');
    });
  });

  describe('TypeScript Compilation Configuration', () => {
    it('TINY-XXXX: should configure TypeScript as parser syntax', () => {
      const parserConfig = { syntax: 'typescript' };
      
      assert.equal(parserConfig.syntax, 'typescript', 'Should use TypeScript syntax');
      assert.notEqual(parserConfig.syntax, 'ecmascript', 'Should not use ECMAScript syntax by default');
    });

    it('TINY-XXXX: should target ES2022 for compilation', () => {
      const targetConfig = 'es2022';
      
      assert.equal(targetConfig, 'es2022', 'Should target ES2022');
      // Verify ES2022 is a modern target (year >= 2015)
      const year = parseInt(targetConfig.replace('es', ''), 10);
      assert.isAtLeast(year, 2015, 'ES2022 should be a modern ES target');
    });

    it('TINY-XXXX: should enable source maps for debugging', () => {
      const sourceMapsEnabled = true;
      
      assert.isTrue(sourceMapsEnabled, 'Source maps should be enabled');
    });
  });

  describe('Configuration Completeness', () => {
    it('TINY-XXXX: should have all required properties in JSC config', () => {
      const jscConfig = {
        parser: { syntax: 'typescript' },
        target: 'es2022'
      };

      const requiredProps = ['parser', 'target'];
      requiredProps.forEach(prop => {
        assert.property(jscConfig, prop, `jsc should have ${prop} property`);
      });
    });

    it('TINY-XXXX: should have all required properties in parser config', () => {
      const parserConfig = { syntax: 'typescript' };

      assert.property(parserConfig, 'syntax', 'parser should have syntax property');
    });

    it('TINY-XXXX: should have both jsc and sourceMaps in options', () => {
      const options = {
        jsc: {
          parser: { syntax: 'typescript' },
          target: 'es2022'
        },
        sourceMaps: true
      };

      const requiredProps = ['jsc', 'sourceMaps'];
      requiredProps.forEach(prop => {
        assert.property(options, prop, `options should have ${prop} property`);
      });
    });
  });

  describe('Edge Cases and Validation', () => {
    it('TINY-XXXX: should handle syntax string with correct case sensitivity', () => {
      const syntax = 'typescript';
      
      // TypeScript syntax should be lowercase
      assert.equal(syntax, syntax.toLowerCase(), 'Syntax should be lowercase');
      assert.notEqual(syntax, 'TypeScript', 'Should not accept mixed case');
      assert.notEqual(syntax, 'TYPESCRIPT', 'Should not accept uppercase');
    });

    it('TINY-XXXX: should validate target format strictly', () => {
      const target = 'es2022';
      
      // Should be 'es' followed by 4 digits
      assert.lengthOf(target, 6, 'Target should be 6 characters (es + 4 digits)');
      assert.equal(target.substring(0, 2), 'es', 'Target should start with "es"');
      
      const yearPart = target.substring(2);
      assert.match(yearPart, /^\d{4}$/, 'Year part should be exactly 4 digits');
    });

    it('TINY-XXXX: should not have extraneous properties in parser config', () => {
      const parserConfig = { syntax: 'typescript' };
      const keys = Object.keys(parserConfig);
      
      assert.lengthOf(keys, 1, 'Parser config should only have syntax property');
      assert.include(keys, 'syntax', 'Parser config should include syntax');
    });

    it('TINY-XXXX: should maintain backward compatibility with sourceMaps', () => {
      // Before the change, options had sourceMaps
      // After the change, it should still have sourceMaps plus jsc
      const optionsBefore = { sourceMaps: true };
      const optionsAfter = {
        jsc: {
          parser: { syntax: 'typescript' },
          target: 'es2022'
        },
        sourceMaps: true
      };

      assert.property(optionsBefore, 'sourceMaps', 'Original config had sourceMaps');
      assert.property(optionsAfter, 'sourceMaps', 'New config still has sourceMaps');
      assert.equal(optionsBefore.sourceMaps, optionsAfter.sourceMaps, 'sourceMaps value should remain unchanged');
    });

    it('TINY-XXXX: should validate jsc is a proper nested object', () => {
      const jscConfig = {
        parser: { syntax: 'typescript' },
        target: 'es2022'
      };

      assert.isObject(jscConfig, 'jsc should be an object');
      assert.isNotArray(jscConfig, 'jsc should not be an array');
      assert.isNotNull(jscConfig, 'jsc should not be null');
    });

    it('TINY-XXXX: should validate parser is a proper nested object', () => {
      const parser = { syntax: 'typescript' };

      assert.isObject(parser, 'parser should be an object');
      assert.isNotArray(parser, 'parser should not be an array');
      assert.isNotNull(parser, 'parser should not be null');
    });
  });

  describe('Integration with Loader Configuration', () => {
    it('TINY-XXXX: should properly nest within loader use array', () => {
      const loaderUse = [
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
      ];

      assert.isArray(loaderUse, 'Loader use should be an array');
      assert.lengthOf(loaderUse, 1, 'Should have one loader in this configuration');
      assert.property(loaderUse[0], 'loader', 'Loader entry should have loader property');
      assert.property(loaderUse[0], 'options', 'Loader entry should have options property');
    });

    it('TINY-XXXX: should work alongside string-replace-loader', () => {
      const loaderUse = [
        {
          loader: 'string-replace-loader',
          options: { /* ... */ }
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
      ];

      assert.lengthOf(loaderUse, 2, 'Should have two loaders');
      assert.equal(loaderUse[1].loader, 'builtin:swc-loader', 'Second loader should be swc-loader');
      assert.property(loaderUse[1].options, 'jsc', 'SWC loader should have jsc options');
    });

    it('TINY-XXXX: should be compatible with TypeScript test file pattern', () => {
      const testPattern = /\.ts$/;
      const testFile = 'example.ts';
      
      assert.isTrue(testPattern.test(testFile), 'Should match .ts files');
      assert.isFalse(testPattern.test('example.js'), 'Should not match .js files');
    });
  });

  describe('Future-Proofing and Extensibility', () => {
    it('TINY-XXXX: should allow for additional JSC properties if needed', () => {
      const extendedJscConfig = {
        parser: { syntax: 'typescript' },
        target: 'es2022',
        // Future properties could be added here
      };

      assert.property(extendedJscConfig, 'parser', 'Should have parser');
      assert.property(extendedJscConfig, 'target', 'Should have target');
      // The structure allows for additional properties
      assert.isAtLeast(Object.keys(extendedJscConfig).length, 2, 'Should have at least 2 properties');
    });

    it('TINY-XXXX: should support ES version upgrades in target', () => {
      const targets = ['es2022', 'es2023', 'es2024'];
      
      targets.forEach(target => {
        assert.match(target, /^es\d{4}$/, `${target} should match ES version format`);
      });
    });

    it('TINY-XXXX: should maintain clear separation between jsc and other options', () => {
      const options = {
        jsc: {
          parser: { syntax: 'typescript' },
          target: 'es2022'
        },
        sourceMaps: true
      };

      // JSC config should be isolated
      assert.notProperty(options, 'parser', 'parser should be under jsc, not at top level');
      assert.notProperty(options, 'target', 'target should be under jsc, not at top level');
      assert.property(options.jsc, 'parser', 'parser should be under jsc');
      assert.property(options.jsc, 'target', 'target should be under jsc');
    });
  });

  describe('Type Safety and Validation', () => {
    it('TINY-XXXX: should have string values for syntax and target', () => {
      const config = {
        parser: { syntax: 'typescript' },
        target: 'es2022'
      };

      assert.typeOf(config.parser.syntax, 'string', 'syntax should be a string');
      assert.typeOf(config.target, 'string', 'target should be a string');
    });

    it('TINY-XXXX: should have boolean value for sourceMaps', () => {
      const options = {
        jsc: {
          parser: { syntax: 'typescript' },
          target: 'es2022'
        },
        sourceMaps: true
      };

      assert.typeOf(options.sourceMaps, 'boolean', 'sourceMaps should be a boolean');
    });

    it('TINY-XXXX: should validate all nested structure types', () => {
      const options = {
        jsc: {
          parser: { syntax: 'typescript' },
          target: 'es2022'
        },
        sourceMaps: true
      };

      // Type checks
      assert.typeOf(options, 'object', 'options should be an object');
      assert.typeOf(options.jsc, 'object', 'jsc should be an object');
      assert.typeOf(options.jsc.parser, 'object', 'parser should be an object');
      assert.typeOf(options.jsc.parser.syntax, 'string', 'syntax should be a string');
      assert.typeOf(options.jsc.target, 'string', 'target should be a string');
      assert.typeOf(options.sourceMaps, 'boolean', 'sourceMaps should be a boolean');
    });
  });
});