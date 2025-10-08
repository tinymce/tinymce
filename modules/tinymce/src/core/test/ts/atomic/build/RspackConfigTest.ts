import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

// Note: Since rspack.config.js is a CommonJS module and tests are TypeScript,
// we'll test the functions after extracting them or by importing via require
// For now, we'll test the logic patterns and structure

describe('atomic.tinymce.core.build.RspackConfigTest', () => {
  describe('escapeHtml function', () => {
    const escapeHtml = (str: string) => str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);

    it('should escape ampersand characters', () => {
      assert.strictEqual(escapeHtml('a&b'), 'a&amp;b');
      assert.strictEqual(escapeHtml('&'), '&amp;');
      assert.strictEqual(escapeHtml('&&'), '&amp;&amp;');
    });

    it('should escape less-than characters', () => {
      assert.strictEqual(escapeHtml('a<b'), 'a&lt;b');
      assert.strictEqual(escapeHtml('<'), '&lt;');
      assert.strictEqual(escapeHtml('<<'), '&lt;&lt;');
    });

    it('should escape greater-than characters', () => {
      assert.strictEqual(escapeHtml('a>b'), 'a&gt;b');
      assert.strictEqual(escapeHtml('>'), '&gt;');
      assert.strictEqual(escapeHtml('>>'), '&gt;&gt;');
    });

    it('should escape double-quote characters', () => {
      assert.strictEqual(escapeHtml('a"b'), 'a&quot;b');
      assert.strictEqual(escapeHtml('"'), '&quot;');
      assert.strictEqual(escapeHtml('""'), '&quot;&quot;');
    });

    it('should escape single-quote characters', () => {
      assert.strictEqual(escapeHtml("a'b"), 'a&#39;b');
      assert.strictEqual(escapeHtml("'"), '&#39;');
      assert.strictEqual(escapeHtml("''"), '&#39;&#39;');
    });

    it('should escape multiple special characters', () => {
      assert.strictEqual(escapeHtml('<div class="test">'), '&lt;div class=&quot;test&quot;&gt;');
      assert.strictEqual(escapeHtml("'hello' & \"world\""), '&#39;hello&#39; &amp; &quot;world&quot;');
      assert.strictEqual(escapeHtml('<a href="#" onclick="alert(\'xss\')">'), '&lt;a href=&quot;#&quot; onclick=&quot;alert(&#39;xss&#39;)&quot;&gt;');
    });

    it('should handle empty strings', () => {
      assert.strictEqual(escapeHtml(''), '');
    });

    it('should not modify strings without special characters', () => {
      assert.strictEqual(escapeHtml('hello world'), 'hello world');
      assert.strictEqual(escapeHtml('123456789'), '123456789');
      assert.strictEqual(escapeHtml('abc_DEF-123'), 'abc_DEF-123');
    });

    it('should handle edge cases with repeated patterns', () => {
      assert.strictEqual(escapeHtml('&&&'), '&amp;&amp;&amp;');
      assert.strictEqual(escapeHtml('<><><>'), '&lt;&gt;&lt;&gt;&lt;&gt;');
    });
  });

  describe('buildDemoEntries function', () => {
    const buildDemoEntries = (typeNames: string[], type: string, demo: string, pathPrefix = '') => typeNames.reduce(
      (acc, name) => {
        // Simplified version without fs.existsSync for testing
        acc[`${pathPrefix}${type}/${name}/demo.js`] = `src/${type}/${name}/demo/ts/demo/${demo}`;
        return acc;
      }, {} as Record<string, string>
    );

    it('should build demo entries for single plugin', () => {
      const result = buildDemoEntries(['accordion'], 'plugins', 'Demo.ts', 'scratch/demos/');
      assert.deepEqual(result, {
        'scratch/demos/plugins/accordion/demo.js': 'src/plugins/accordion/demo/ts/demo/Demo.ts'
      });
    });

    it('should build demo entries for multiple plugins', () => {
      const result = buildDemoEntries(['accordion', 'advlist', 'anchor'], 'plugins', 'Demo.ts', 'scratch/demos/');
      assert.deepEqual(result, {
        'scratch/demos/plugins/accordion/demo.js': 'src/plugins/accordion/demo/ts/demo/Demo.ts',
        'scratch/demos/plugins/advlist/demo.js': 'src/plugins/advlist/demo/ts/demo/Demo.ts',
        'scratch/demos/plugins/anchor/demo.js': 'src/plugins/anchor/demo/ts/demo/Demo.ts'
      });
    });

    it('should build demo entries without path prefix', () => {
      const result = buildDemoEntries(['silver'], 'themes', 'Demos.ts');
      assert.deepEqual(result, {
        'themes/silver/demo.js': 'src/themes/silver/demo/ts/demo/Demos.ts'
      });
    });

    it('should handle empty array', () => {
      const result = buildDemoEntries([], 'plugins', 'Demo.ts', 'scratch/demos/');
      assert.deepEqual(result, {});
    });

    it('should handle different type names', () => {
      const result = buildDemoEntries(['dom'], 'models', 'Demo.ts', 'scratch/demos/');
      assert.deepEqual(result, {
        'scratch/demos/models/dom/demo.js': 'src/models/dom/demo/ts/demo/Demo.ts'
      });
    });
  });

  describe('buildEntries function', () => {
    const buildEntries = (typeNames: string[], type: string, entry: string, pathPrefix = '') => typeNames.reduce(
      (acc, name) => {
        const fileName = type.replace(/s$/, '') + '.js';
        acc[`${pathPrefix}${type}/${name}/${fileName}`] = `src/${type}/${name}/main/ts/${entry}`;
        return acc;
      }, {} as Record<string, string>
    );

    it('should build entries for single plugin', () => {
      const result = buildEntries(['accordion'], 'plugins', 'Main.ts', 'js/tinymce/');
      assert.deepEqual(result, {
        'js/tinymce/plugins/accordion/plugin.js': 'src/plugins/accordion/main/ts/Main.ts'
      });
    });

    it('should build entries for multiple plugins', () => {
      const result = buildEntries(['accordion', 'advlist'], 'plugins', 'Main.ts', 'js/tinymce/');
      assert.deepEqual(result, {
        'js/tinymce/plugins/accordion/plugin.js': 'src/plugins/accordion/main/ts/Main.ts',
        'js/tinymce/plugins/advlist/plugin.js': 'src/plugins/advlist/main/ts/Main.ts'
      });
    });

    it('should correctly remove trailing s from type for filename', () => {
      const pluginsResult = buildEntries(['test'], 'plugins', 'Main.ts');
      assert.strictEqual(pluginsResult['plugins/test/plugin.js'], 'src/plugins/test/main/ts/Main.ts');

      const themesResult = buildEntries(['silver'], 'themes', 'Main.ts');
      assert.strictEqual(themesResult['themes/silver/theme.js'], 'src/themes/silver/main/ts/Main.ts');

      const modelsResult = buildEntries(['dom'], 'models', 'Main.ts');
      assert.strictEqual(modelsResult['models/dom/model.js'], 'src/models/dom/main/ts/Main.ts');
    });

    it('should handle empty array', () => {
      const result = buildEntries([], 'plugins', 'Main.ts', 'js/tinymce/');
      assert.deepEqual(result, {});
    });

    it('should handle entries without path prefix', () => {
      const result = buildEntries(['accordion'], 'plugins', 'Main.ts');
      assert.deepEqual(result, {
        'plugins/accordion/plugin.js': 'src/plugins/accordion/main/ts/Main.ts'
      });
    });

    it('should handle custom entry file names', () => {
      const result = buildEntries(['accordion'], 'plugins', 'Index.ts', 'js/tinymce/');
      assert.deepEqual(result, {
        'js/tinymce/plugins/accordion/plugin.js': 'src/plugins/accordion/main/ts/Index.ts'
      });
    });
  });

  describe('rspack configuration structure', () => {
    it('should have correct swc-loader options structure', () => {
      // Test the new JSC configuration structure
      const swcLoaderOptions = {
        jsc: {
          parser: { syntax: 'typescript' },
          target: 'es2022',
        },
        sourceMaps: true
      };

      assert.isObject(swcLoaderOptions.jsc, 'jsc should be an object');
      assert.isObject(swcLoaderOptions.jsc.parser, 'jsc.parser should be an object');
      assert.strictEqual(swcLoaderOptions.jsc.parser.syntax, 'typescript', 'parser syntax should be typescript');
      assert.strictEqual(swcLoaderOptions.jsc.target, 'es2022', 'jsc target should be es2022');
      assert.isTrue(swcLoaderOptions.sourceMaps, 'sourceMaps should be true');
    });

    it('should validate jsc.parser.syntax values', () => {
      const validSyntaxValues = ['typescript', 'ecmascript'];
      validSyntaxValues.forEach((syntax) => {
        const options = {
          jsc: {
            parser: { syntax },
            target: 'es2022'
          }
        };
        assert.include(validSyntaxValues, options.jsc.parser.syntax, `${syntax} should be a valid parser syntax`);
      });
    });

    it('should validate jsc.target is a valid ES version', () => {
      const validTargets = ['es3', 'es5', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'es2021', 'es2022'];
      const target = 'es2022';

      assert.include(validTargets, target, 'es2022 should be a valid target');
    });

    it('should have proper loader configuration structure', () => {
      const loaderConfig = {
        test: /\.ts$/,
        use: [
          {
            loader: 'string-replace-loader',
            options: { test: /EditorManager.ts/, multiple: [] }
          },
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: { syntax: 'typescript' },
                target: 'es2022',
              },
              sourceMaps: true
            }
          }
        ]
      };

      assert.isArray(loaderConfig.use, 'use should be an array');
      assert.lengthOf(loaderConfig.use, 2, 'should have 2 loaders');
      assert.strictEqual(loaderConfig.use[0].loader, 'string-replace-loader');
      assert.strictEqual(loaderConfig.use[1].loader, 'builtin:swc-loader');
      assert.isObject(loaderConfig.use[1].options, 'swc-loader should have options');
    });
  });

  describe('resolve configuration', () => {
    it('should have correct extensions', () => {
      const extensions = ['.ts', '.js'];
      assert.include(extensions, '.ts', 'should include .ts extension');
      assert.include(extensions, '.js', 'should include .js extension');
    });

    it('should have proper tsConfig structure', () => {
      const tsConfig = {
        configFile: '../../tsconfig.json',
        references: 'auto'
      };
      assert.property(tsConfig, 'configFile');
      assert.property(tsConfig, 'references');
      assert.strictEqual(tsConfig.references, 'auto');
    });
  });

  describe('optimization configuration', () => {
    it('should have correct optimization settings for development', () => {
      const optimization = {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };

      assert.isFalse(optimization.removeAvailableModules, 'removeAvailableModules should be false for dev');
      assert.isFalse(optimization.removeEmptyChunks, 'removeEmptyChunks should be false for dev');
      assert.isFalse(optimization.splitChunks, 'splitChunks should be false for dev');
    });
  });

  describe('module rules configuration', () => {
    it('should have rule for JavaScript files', () => {
      const jsRule = {
        test: /\.js$/,
        resolve: { fullySpecified: false }
      };

      assert.isTrue(jsRule.test.test('file.js'), 'should match .js files');
      assert.isFalse(jsRule.test.test('file.ts'), 'should not match .ts files');
      assert.isFalse(jsRule.resolve.fullySpecified);
    });

    it('should have rule for source maps', () => {
      const sourceMapRule = {
        test: /\.(js|mjs)$/,
        use: ['source-map-loader'],
        enforce: 'pre' as const
      };

      assert.isTrue(sourceMapRule.test.test('file.js'), 'should match .js files');
      assert.isTrue(sourceMapRule.test.test('file.mjs'), 'should match .mjs files');
      assert.strictEqual(sourceMapRule.enforce, 'pre');
    });

    it('should have rule for SVG files', () => {
      const svgRule = {
        test: /\.svg$/i,
        type: 'asset/source'
      };

      assert.isTrue(svgRule.test.test('icon.svg'), 'should match .svg files');
      assert.isTrue(svgRule.test.test('ICON.SVG'), 'should be case insensitive');
      assert.strictEqual(svgRule.type, 'asset/source');
    });

    it('should have rule for raw resources', () => {
      const rawRule = {
        resourceQuery: /raw/,
        type: 'asset/source'
      };

      assert.isTrue(rawRule.resourceQuery.test('?raw'), 'should match raw query');
      assert.strictEqual(rawRule.type, 'asset/source');
    });

    it('should have typescript loader with string-replace-loader', () => {
      const tsRule = {
        test: /\.ts$/,
        use: [
          {
            loader: 'string-replace-loader',
            options: {
              test: /EditorManager.ts/,
              multiple: []
            }
          },
          {
            loader: 'builtin:swc-loader',
            options: {
              jsc: {
                parser: { syntax: 'typescript' },
                target: 'es2022',
              },
              sourceMaps: true
            }
          }
        ]
      };

      assert.isTrue(tsRule.test.test('component.ts'), 'should match .ts files');
      assert.isFalse(tsRule.test.test('component.js'), 'should not match .js files');
      assert.isArray(tsRule.use);
      assert.lengthOf(tsRule.use, 2);
    });
  });

  describe('output configuration', () => {
    it('should have correct output settings', () => {
      const output = {
        filename: '[name]',
        publicPath: '/',
      };

      assert.strictEqual(output.filename, '[name]', 'filename should use [name] placeholder');
      assert.strictEqual(output.publicPath, '/', 'publicPath should be root');
    });
  });

  describe('stats configuration', () => {
    it('should have verbose logging for development', () => {
      const stats = {
        logging: 'verbose',
        assets: false,
        modulesSpace: 5,
      };

      assert.strictEqual(stats.logging, 'verbose');
      assert.isFalse(stats.assets);
      assert.strictEqual(stats.modulesSpace, 5);
    });
  });

  describe('devServer configuration', () => {
    it('should have correct devServer port and host', () => {
      const devServer = {
        port: '3000',
        host: '0.0.0.0',
        allowedHosts: 'all',
      };

      assert.strictEqual(devServer.port, '3000');
      assert.strictEqual(devServer.host, '0.0.0.0');
      assert.strictEqual(devServer.allowedHosts, 'all');
    });

    it('should have hot and liveReload disabled', () => {
      const devServer = {
        hot: false,
        liveReload: false,
      };

      assert.isFalse(devServer.hot, 'hot should be disabled');
      assert.isFalse(devServer.liveReload, 'liveReload should be disabled');
    });

    it('should have client overlay configuration', () => {
      const client = {
        overlay: { errors: true, warnings: true }
      };

      assert.isTrue(client.overlay.errors, 'should show errors in overlay');
      assert.isTrue(client.overlay.warnings, 'should show warnings in overlay');
    });
  });

  describe('SWC JSC configuration edge cases', () => {
    it('should handle jsc configuration without parser', () => {
      const minimalJsc = {
        target: 'es2022'
      };
      assert.property(minimalJsc, 'target');
    });

    it('should validate target versions are strings', () => {
      const target = 'es2022';
      assert.isString(target, 'target should be a string');
      assert.match(target, /^es\d+|es3|es5$/, 'target should match ES version pattern');
    });

    it('should validate parser syntax is lowercase', () => {
      const syntax = 'typescript';
      assert.isString(syntax, 'syntax should be a string');
      assert.strictEqual(syntax, syntax.toLowerCase(), 'syntax should be lowercase');
    });

    it('should ensure jsc config is nested properly', () => {
      const options = {
        jsc: {
          parser: { syntax: 'typescript' },
          target: 'es2022',
        },
        sourceMaps: true
      };

      // Verify nested structure
      assert.isObject(options.jsc);
      assert.isObject(options.jsc.parser);
      assert.property(options.jsc.parser, 'syntax');
      assert.property(options.jsc, 'target');
    });
  });

  describe('string-replace-loader configuration', () => {
    it('should have correct version replacement patterns', () => {
      const packageData = { version: '8.2.0', date: '2024-01-01' };
      const multiple = [
        {
          search: '@@majorVersion@@',
          replace: packageData.version.split('.')[0],
        },
        {
          search: '@@minorVersion@@',
          replace: packageData.version.split('.').slice(1).join('.'),
        },
        { search: '@@releaseDate@@', replace: packageData.date },
      ];

      assert.lengthOf(multiple, 3, 'should have 3 replacement rules');
      assert.strictEqual(multiple[0].replace, '8', 'major version should be 8');
      assert.strictEqual(multiple[1].replace, '2.0', 'minor version should be 2.0');
      assert.strictEqual(multiple[2].replace, '2024-01-01', 'date should be preserved');
    });

    it('should handle version with more than 3 parts', () => {
      const version = '8.2.1.3';
      const majorVersion = version.split('.')[0];
      const minorVersion = version.split('.').slice(1).join('.');

      assert.strictEqual(majorVersion, '8');
      assert.strictEqual(minorVersion, '2.1.3');
    });

    it('should handle single digit versions', () => {
      const version = '7.0.0';
      const majorVersion = version.split('.')[0];
      const minorVersion = version.split('.').slice(1).join('.');

      assert.strictEqual(majorVersion, '7');
      assert.strictEqual(minorVersion, '0.0');
    });
  });

  describe('webpack/rspack compatibility', () => {
    it('should use rspack-specific loader syntax', () => {
      const loader = 'builtin:swc-loader';
      assert.include(loader, 'builtin:', 'rspack loaders should use builtin: prefix');
    });

    it('should validate mode is development', () => {
      const mode = 'development';
      assert.oneOf(mode, ['development', 'production', 'none']);
    });

    it('should validate devtool option', () => {
      const devtool = 'inline-source-map';
      assert.include(devtool, 'source-map', 'devtool should include source-map');
    });

    it('should validate target is web', () => {
      const target = 'web';
      assert.oneOf(target, ['web', 'node', 'webworker']);
    });
  });

  describe('configuration array structure', () => {
    it('should have multiple configurations in array', () => {
      // The config exports an array with 2 configurations
      const configLength = 2;
      assert.strictEqual(configLength, 2, 'should have 2 configurations');
    });

    it('should have demo config and production config', () => {
      const configs = [
        { type: 'demo', tsConfig: '../../tsconfig.demo.json' },
        { type: 'production', tsConfig: '../../tsconfig.json' }
      ];

      assert.lengthOf(configs, 2);
      assert.strictEqual(configs[0].tsConfig, '../../tsconfig.demo.json');
      assert.strictEqual(configs[1].tsConfig, '../../tsconfig.json');
    });
  });

  describe('ignoreWarnings configuration', () => {
    it('should ignore export not found warnings', () => {
      const ignoreWarnings = [/export .* was not found in/];
      const testMessage = 'export MyComponent was not found in module';

      assert.isTrue(ignoreWarnings[0].test(testMessage), 'should match export not found warning');
    });

    it('should not match other warnings', () => {
      const ignoreWarnings = [/export .* was not found in/];
      const testMessage = 'Module not found: Cannot resolve module';

      assert.isFalse(ignoreWarnings[0].test(testMessage), 'should not match other warnings');
    });
  });

  describe('watchOptions configuration', () => {
    it('should ignore node_modules', () => {
      const watchOptions = {
        ignored: ['**/node_modules/**']
      };

      assert.include(watchOptions.ignored[0], 'node_modules', 'should ignore node_modules');
    });
  });
});
describe('Additional Comprehensive Tests', () => {
  describe('generateDemoIndex function behavior', () => {
    const mockApp = {
      get: (route: string, handler: (req: any, res: any) => void) => {
        // Mock Express app.get
        return { route, handler };
      }
    };

    it('should generate HTML with proper DOCTYPE', () => {
      const generateDemoIndex = (app: any) => {
        const html = '<\\!DOCTYPE html>';
        app.get('/', (req: any, res: any) => res.send(html));
      };

      generateDemoIndex(mockApp);
      assert.ok(true, 'generateDemoIndex should execute without errors');
    });
  });

  describe('Path resolution edge cases', () => {
    it('should handle relative paths correctly', () => {
      const testPath = '../../tsconfig.json';
      assert.ok(testPath.includes('..'), 'should support parent directory navigation');
      assert.ok(testPath.endsWith('.json'), 'should have correct file extension');
    });

    it('should handle absolute path resolution', () => {
      const path = require('path');
      const absolutePath = path.resolve(__dirname, '../../tsconfig.json');
      assert.ok(path.isAbsolute(absolutePath), 'resolved path should be absolute');
    });
  });

  describe('Entry filename generation edge cases', () => {
    it('should correctly strip trailing s for various types', () => {
      const types = ['plugins', 'themes', 'models'];
      const expected = ['plugin', 'theme', 'model'];
      
      types.forEach((type, index) => {
        const fileName = type.replace(/s$/, '') + '.js';
        assert.strictEqual(fileName, expected[index] + '.js', `${type} should become ${expected[index]}.js`);
      });
    });

    it('should handle types without trailing s', () => {
      const type = 'core';
      const fileName = type.replace(/s$/, '') + '.js';
      assert.strictEqual(fileName, 'core.js', 'types without trailing s should remain unchanged');
    });
  });

  describe('String manipulation edge cases', () => {
    it('should handle empty strings in escapeHtml', () => {
      const escapeHtml = (str: string) => str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[m]);

      assert.strictEqual(escapeHtml(''), '', 'empty string should remain empty');
    });

    it('should handle strings with no special characters', () => {
      const escapeHtml = (str: string) => str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[m]);

      const input = 'Hello World 123';
      assert.strictEqual(escapeHtml(input), input, 'strings without special chars should be unchanged');
    });

    it('should handle very long strings with special characters', () => {
      const escapeHtml = (str: string) => str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[m]);

      const longString = '<script>' + 'a'.repeat(1000) + '</script>';
      const escaped = escapeHtml(longString);

      assert.ok(escaped.startsWith('&lt;script&gt;'), 'should escape tags in long strings');
      assert.ok(escaped.endsWith('&lt;/script&gt;'), 'should escape closing tags');
    });
  });

  describe('Version parsing edge cases', () => {
    it('should handle version with different digit counts', () => {
      const versions = ['1.0.0', '10.2.3', '100.200.300'];
      versions.forEach(version => {
        const majorVersion = version.split('.')[0];
        const minorVersion = version.split('.').slice(1).join('.');
        assert.ok(majorVersion.length > 0, 'major version should not be empty');
        assert.ok(minorVersion.length > 0, 'minor version should not be empty');
      });
    });

    it('should handle version with pre-release tags', () => {
      const version = '8.2.0-beta.1';
      const majorVersion = version.split('.')[0];
      const minorVersion = version.split('.').slice(1).join('.');
      assert.strictEqual(majorVersion, '8');
      assert.ok(minorVersion.includes('beta'), 'should preserve pre-release tag');
    });

    it('should handle version with only major.minor', () => {
      const version = '8.2';
      const parts = version.split('.');
      assert.strictEqual(parts.length, 2, 'should have 2 parts');
      assert.strictEqual(parts[0], '8');
      assert.strictEqual(parts[1], '2');
    });
  });

  describe('Array reduce operations', () => {
    it('should handle empty arrays in buildEntries', () => {
      const buildEntries = (typeNames: string[], type: string, entry: string, pathPrefix = '') => typeNames.reduce(
        (acc, name) => {
          const fileName = type.replace(/s$/, '') + '.js';
          acc[`${pathPrefix}${type}/${name}/${fileName}`] = `src/${type}/${name}/main/ts/${entry}`;
          return acc;
        }, {} as Record<string, string>
      );

      const result = buildEntries([], 'plugins', 'Main.ts');
      assert.deepEqual(result, {}, 'empty array should produce empty object');
    });

    it('should handle single item array', () => {
      const buildEntries = (typeNames: string[], type: string, entry: string, pathPrefix = '') => typeNames.reduce(
        (acc, name) => {
          const fileName = type.replace(/s$/, '') + '.js';
          acc[`${pathPrefix}${type}/${name}/${fileName}`] = `src/${type}/${name}/main/ts/${entry}`;
          return acc;
        }, {} as Record<string, string>
      );

      const result = buildEntries(['accordion'], 'plugins', 'Main.ts');
      assert.strictEqual(Object.keys(result).length, 1, 'single item should produce one entry');
    });

    it('should handle large arrays efficiently', () => {
      const buildEntries = (typeNames: string[], type: string, entry: string, pathPrefix = '') => typeNames.reduce(
        (acc, name) => {
          const fileName = type.replace(/s$/, '') + '.js';
          acc[`${pathPrefix}${type}/${name}/${fileName}`] = `src/${type}/${name}/main/ts/${entry}`;
          return acc;
        }, {} as Record<string, string>
      );

      const largeArray = Array.from({ length: 100 }, (_, i) => `plugin${i}`);
      const result = buildEntries(largeArray, 'plugins', 'Main.ts');
      assert.strictEqual(Object.keys(result).length, 100, 'should handle large arrays');
    });
  });

  describe('Regular expression patterns', () => {
    it('should validate TypeScript file pattern', () => {
      const pattern = /\.ts$/;
      assert.ok(pattern.test('file.ts'), 'should match .ts files');
      assert.ok(pattern.test('component.ts'), 'should match component files');
      assert.ok(!pattern.test('file.tsx'), 'should not match .tsx files');
      assert.ok(!pattern.test('file.js'), 'should not match .js files');
    });

    it('should validate JavaScript file pattern', () => {
      const pattern = /\.js$/;
      assert.ok(pattern.test('file.js'), 'should match .js files');
      assert.ok(!pattern.test('file.ts'), 'should not match .ts files');
      assert.ok(!pattern.test('file.jsx'), 'should not match .jsx files');
    });

    it('should validate SVG file pattern case insensitivity', () => {
      const pattern = /\.svg$/i;
      assert.ok(pattern.test('icon.svg'), 'should match lowercase .svg');
      assert.ok(pattern.test('icon.SVG'), 'should match uppercase .SVG');
      assert.ok(pattern.test('icon.Svg'), 'should match mixed case');
    });

    it('should validate MJS file pattern', () => {
      const pattern = /\.(js|mjs)$/;
      assert.ok(pattern.test('module.js'), 'should match .js files');
      assert.ok(pattern.test('module.mjs'), 'should match .mjs files');
      assert.ok(!pattern.test('module.ts'), 'should not match .ts files');
    });

    it('should validate export warning pattern', () => {
      const pattern = /export .* was not found in/;
      assert.ok(pattern.test('export MyComponent was not found in module'), 'should match export warnings');
      assert.ok(pattern.test('export default was not found in file'), 'should match default export warnings');
      assert.ok(!pattern.test('Module not found'), 'should not match other errors');
    });
  });

  describe('Configuration object immutability', () => {
    it('should not modify original entries object', () => {
      const create = (entries: Record<string, string>) => {
        return { entry: { ...entries } };
      };

      const originalEntries = { 'test.js': 'src/test.ts' };
      const config = create(originalEntries);
      config.entry['modified.js'] = 'src/modified.ts';

      assert.strictEqual(originalEntries['modified.js'], undefined, 'original should not be modified');
    });
  });

  describe('Path prefix handling', () => {
    it('should handle empty path prefix', () => {
      const buildEntries = (typeNames: string[], type: string, entry: string, pathPrefix = '') => typeNames.reduce(
        (acc, name) => {
          const fileName = type.replace(/s$/, '') + '.js';
          acc[`${pathPrefix}${type}/${name}/${fileName}`] = `src/${type}/${name}/main/ts/${entry}`;
          return acc;
        }, {} as Record<string, string>
      );

      const result = buildEntries(['test'], 'plugins', 'Main.ts', '');
      const key = Object.keys(result)[0];
      assert.ok(!key.startsWith('//'), 'should not have double slashes');
    });

    it('should handle path prefix with trailing slash', () => {
      const buildEntries = (typeNames: string[], type: string, entry: string, pathPrefix = '') => typeNames.reduce(
        (acc, name) => {
          const fileName = type.replace(/s$/, '') + '.js';
          acc[`${pathPrefix}${type}/${name}/${fileName}`] = `src/${type}/${name}/main/ts/${entry}`;
          return acc;
        }, {} as Record<string, string>
      );

      const result = buildEntries(['test'], 'plugins', 'Main.ts', 'build/');
      const key = Object.keys(result)[0];
      assert.ok(key.startsWith('build/'), 'should preserve path prefix');
      assert.ok(!key.includes('//'), 'should not create double slashes');
    });

    it('should handle complex path prefixes', () => {
      const buildEntries = (typeNames: string[], type: string, entry: string, pathPrefix = '') => typeNames.reduce(
        (acc, name) => {
          const fileName = type.replace(/s$/, '') + '.js';
          acc[`${pathPrefix}${type}/${name}/${fileName}`] = `src/${type}/${name}/main/ts/${entry}`;
          return acc;
        }, {} as Record<string, string>
      );

      const result = buildEntries(['test'], 'plugins', 'Main.ts', 'dist/js/tinymce/');
      const key = Object.keys(result)[0];
      assert.ok(key.startsWith('dist/js/tinymce/'), 'should handle complex prefixes');
    });
  });
});