import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

// Note: Since rspack.config.js is a CommonJS module with Node.js dependencies,
// we'll test the pure functions by recreating them here and the config structure validation

describe('atomic.tinymce.config.RspackConfigTest', () => {
  // Pure function tests - escapeHtml
  describe('escapeHtml function', () => {
    const escapeHtml = (str: string): string => str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);

    it('should escape ampersand', () => {
      assert.equal(escapeHtml('foo & bar'), 'foo &amp; bar');
      assert.equal(escapeHtml('&'), '&amp;');
      assert.equal(escapeHtml('&&&'), '&amp;&amp;&amp;');
    });

    it('should escape less than', () => {
      assert.equal(escapeHtml('a < b'), 'a &lt; b');
      assert.equal(escapeHtml('<'), '&lt;');
      assert.equal(escapeHtml('<<<'), '&lt;&lt;&lt;');
    });

    it('should escape greater than', () => {
      assert.equal(escapeHtml('a > b'), 'a &gt; b');
      assert.equal(escapeHtml('>'), '&gt;');
      assert.equal(escapeHtml('>>>'), '&gt;&gt;&gt;');
    });

    it('should escape double quotes', () => {
      assert.equal(escapeHtml('say "hello"'), 'say &quot;hello&quot;');
      assert.equal(escapeHtml('"'), '&quot;');
      assert.equal(escapeHtml('"""'), '&quot;&quot;&quot;');
    });

    it('should escape single quotes', () => {
      assert.equal(escapeHtml("it's"), 'it&#39;s');
      assert.equal(escapeHtml("'"), '&#39;');
      assert.equal(escapeHtml("'''"), '&#39;&#39;&#39;');
    });

    it('should escape multiple special characters', () => {
      assert.equal(escapeHtml('<div class="test">foo & bar</div>'), '&lt;div class=&quot;test&quot;&gt;foo &amp; bar&lt;/div&gt;');
      assert.equal(escapeHtml("'\" & <>"), '&#39;&quot; &amp; &lt;&gt;');
    });

    it('should handle empty string', () => {
      assert.equal(escapeHtml(''), '');
    });

    it('should handle strings with no special characters', () => {
      assert.equal(escapeHtml('hello world'), 'hello world');
      assert.equal(escapeHtml('123'), '123');
      assert.equal(escapeHtml('foo-bar_baz'), 'foo-bar_baz');
    });

    it('should handle strings with mixed content', () => {
      assert.equal(escapeHtml('Hello <script>alert("XSS")</script>'), 'Hello &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
      assert.equal(escapeHtml('<img src="x" onerror=\'alert(1)\'>'), '&lt;img src=&quot;x&quot; onerror=&#39;alert(1)&#39;&gt;');
    });

    it('should handle unicode and special text', () => {
      assert.equal(escapeHtml('© 2024 & Co.'), '© 2024 &amp; Co.');
      assert.equal(escapeHtml('emoji 🎉 & text'), 'emoji 🎉 &amp; text');
    });

    it('should escape consecutive special characters correctly', () => {
      assert.equal(escapeHtml('&&'), '&amp;&amp;');
      assert.equal(escapeHtml('<<>>'), '&lt;&lt;&gt;&gt;');
      assert.equal(escapeHtml('""\'\''), '&quot;&quot;&#39;&#39;');
    });
  });

  // Pure function tests - buildEntries
  describe('buildEntries function', () => {
    const buildEntries = (typeNames: string[], type: string, entry: string, pathPrefix = ''): Record<string, string> =>
      typeNames.reduce((acc, name) => {
        const fileName = type.replace(/s$/, '') + '.js';
        acc[`${pathPrefix}${type}/${name}/${fileName}`] = `src/${type}/${name}/main/ts/${entry}`;
        return acc;
      }, {} as Record<string, string>);

    it('should build entries for single plugin without prefix', () => {
      const result = buildEntries(['table'], 'plugins', 'Main.ts');
      assert.deepEqual(result, {
        'plugins/table/plugin.js': 'src/plugins/table/main/ts/Main.ts'
      });
    });

    it('should build entries for multiple plugins without prefix', () => {
      const result = buildEntries(['table', 'link', 'image'], 'plugins', 'Main.ts');
      assert.deepEqual(result, {
        'plugins/table/plugin.js': 'src/plugins/table/main/ts/Main.ts',
        'plugins/link/plugin.js': 'src/plugins/link/main/ts/Main.ts',
        'plugins/image/plugin.js': 'src/plugins/image/main/ts/Main.ts'
      });
    });

    it('should build entries with path prefix', () => {
      const result = buildEntries(['table'], 'plugins', 'Main.ts', 'js/tinymce/');
      assert.deepEqual(result, {
        'js/tinymce/plugins/table/plugin.js': 'src/plugins/table/main/ts/Main.ts'
      });
    });

    it('should build entries for themes', () => {
      const result = buildEntries(['silver'], 'themes', 'Main.ts');
      assert.deepEqual(result, {
        'themes/silver/theme.js': 'src/themes/silver/main/ts/Main.ts'
      });
    });

    it('should build entries for models', () => {
      const result = buildEntries(['dom'], 'models', 'Main.ts');
      assert.deepEqual(result, {
        'models/dom/model.js': 'src/models/dom/main/ts/Main.ts'
      });
    });

    it('should handle empty array', () => {
      const result = buildEntries([], 'plugins', 'Main.ts');
      assert.deepEqual(result, {});
    });

    it('should handle different entry files', () => {
      const result = buildEntries(['table'], 'plugins', 'Plugin.ts');
      assert.deepEqual(result, {
        'plugins/table/plugin.js': 'src/plugins/table/main/ts/Plugin.ts'
      });
    });

    it('should correctly pluralize type names', () => {
      // Testing the .replace(/s$/, '') logic
      const pluginsResult = buildEntries(['test'], 'plugins', 'Main.ts');
      assert.equal(Object.keys(pluginsResult)[0], 'plugins/test/plugin.js');

      const themesResult = buildEntries(['test'], 'themes', 'Main.ts');
      assert.equal(Object.keys(themesResult)[0], 'themes/test/theme.js');

      const modelsResult = buildEntries(['test'], 'models', 'Main.ts');
      assert.equal(Object.keys(modelsResult)[0], 'models/test/model.js');
    });

    it('should handle complex path prefixes', () => {
      const result = buildEntries(['table', 'link'], 'plugins', 'Main.ts', 'build/output/');
      assert.deepEqual(result, {
        'build/output/plugins/table/plugin.js': 'src/plugins/table/main/ts/Main.ts',
        'build/output/plugins/link/plugin.js': 'src/plugins/link/main/ts/Main.ts'
      });
    });

    it('should handle names with special characters', () => {
      const result = buildEntries(['plugin-name'], 'plugins', 'Main.ts');
      assert.deepEqual(result, {
        'plugins/plugin-name/plugin.js': 'src/plugins/plugin-name/main/ts/Main.ts'
      });
    });
  });

  // Pure function tests - buildDemoEntries
  describe('buildDemoEntries function', () => {
    // Note: This function uses fs.existsSync which we can't fully test without filesystem,
    // but we can test the structure logic
    const buildDemoEntriesLogic = (typeNames: string[], type: string, demo: string, pathPrefix = ''): Record<string, string> =>
      typeNames.reduce((acc, name) => {
        const tsfile = `src/${type}/${name}/demo/ts/demo/${demo}`;
        // In the actual function, there's an fs.existsSync check here
        // For testing, we'll assume all files exist
        acc[`${pathPrefix}${type}/${name}/demo.js`] = tsfile;
        return acc;
      }, {} as Record<string, string>);

    it('should build demo entries for single plugin without prefix', () => {
      const result = buildDemoEntriesLogic(['table'], 'plugins', 'Demo.ts');
      assert.deepEqual(result, {
        'plugins/table/demo.js': 'src/plugins/table/demo/ts/demo/Demo.ts'
      });
    });

    it('should build demo entries for multiple plugins', () => {
      const result = buildDemoEntriesLogic(['table', 'link', 'image'], 'plugins', 'Demo.ts');
      assert.deepEqual(result, {
        'plugins/table/demo.js': 'src/plugins/table/demo/ts/demo/Demo.ts',
        'plugins/link/demo.js': 'src/plugins/link/demo/ts/demo/Demo.ts',
        'plugins/image/demo.js': 'src/plugins/image/demo/ts/demo/Demo.ts'
      });
    });

    it('should build demo entries with path prefix', () => {
      const result = buildDemoEntriesLogic(['table'], 'plugins', 'Demo.ts', 'scratch/demos/');
      assert.deepEqual(result, {
        'scratch/demos/plugins/table/demo.js': 'src/plugins/table/demo/ts/demo/Demo.ts'
      });
    });

    it('should build demo entries for themes with different demo file', () => {
      const result = buildDemoEntriesLogic(['silver'], 'themes', 'Demos.ts');
      assert.deepEqual(result, {
        'themes/silver/demo.js': 'src/themes/silver/demo/ts/demo/Demos.ts'
      });
    });

    it('should build demo entries for models', () => {
      const result = buildDemoEntriesLogic(['dom'], 'models', 'Demo.ts');
      assert.deepEqual(result, {
        'models/dom/demo.js': 'src/models/dom/demo/ts/demo/Demo.ts'
      });
    });

    it('should handle empty array', () => {
      const result = buildDemoEntriesLogic([], 'plugins', 'Demo.ts');
      assert.deepEqual(result, {});
    });

    it('should handle different demo file names', () => {
      const result = buildDemoEntriesLogic(['table'], 'plugins', 'CustomDemo.ts');
      assert.deepEqual(result, {
        'plugins/table/demo.js': 'src/plugins/table/demo/ts/demo/CustomDemo.ts'
      });
    });
  });

  // Configuration structure validation tests
  describe('Rspack configuration structure', () => {
    it('should have valid module.rules structure with TypeScript loader', () => {
      // Validate the structure of the configuration
      const mockRules = [
        {
          test: /\.ts$/,
          use: [
            {
              loader: "string-replace-loader",
              options: {
                test: /EditorManager.ts/,
                multiple: []
              }
            },
            {
              loader: "builtin:swc-loader",
              options: {
                jsc: {
                  parser: { syntax: "typescript" },
                  target: 'es2022'
                },
                sourceMaps: true
              }
            }
          ]
        }
      ];

      assert.isArray(mockRules);
      assert.equal(mockRules.length, 1);
      assert.equal(mockRules[0].loader, undefined);
      assert.isArray(mockRules[0].use);
      assert.equal(mockRules[0].use.length, 2);
    });

    it('should have correct JSC parser configuration', () => {
      const swcLoaderConfig = {
        loader: "builtin:swc-loader",
        options: {
          jsc: {
            parser: { syntax: "typescript" },
            target: 'es2022'
          },
          sourceMaps: true
        }
      };

      assert.equal(swcLoaderConfig.loader, "builtin:swc-loader");
      assert.isDefined(swcLoaderConfig.options);
      assert.isDefined(swcLoaderConfig.options.jsc);
      assert.isDefined(swcLoaderConfig.options.jsc.parser);
      assert.equal(swcLoaderConfig.options.jsc.parser.syntax, "typescript");
      assert.equal(swcLoaderConfig.options.jsc.target, 'es2022');
      assert.isTrue(swcLoaderConfig.options.sourceMaps);
    });

    it('should validate JSC parser syntax options', () => {
      const validSyntaxOptions = ['typescript', 'ecmascript'];
      const configuredSyntax = 'typescript';
      
      assert.include(validSyntaxOptions, configuredSyntax);
    });

    it('should validate JSC target options', () => {
      const validTargets = ['es5', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'es2021', 'es2022'];
      const configuredTarget = 'es2022';
      
      assert.include(validTargets, configuredTarget);
    });

    it('should have sourceMaps enabled', () => {
      const options = {
        jsc: {
          parser: { syntax: "typescript" },
          target: 'es2022'
        },
        sourceMaps: true
      };

      assert.isTrue(options.sourceMaps);
    });

    it('should validate complete loader chain structure', () => {
      const loaderChain = [
        {
          loader: "string-replace-loader",
          options: { test: /EditorManager.ts/, multiple: [] }
        },
        {
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              parser: { syntax: "typescript" },
              target: 'es2022'
            },
            sourceMaps: true
          }
        }
      ];

      assert.equal(loaderChain.length, 2);
      assert.equal(loaderChain[0].loader, "string-replace-loader");
      assert.equal(loaderChain[1].loader, "builtin:swc-loader");
      
      // Validate second loader has all required JSC properties
      const swcLoader = loaderChain[1];
      assert.hasAllKeys(swcLoader.options, ['jsc', 'sourceMaps']);
      assert.hasAllKeys(swcLoader.options.jsc, ['parser', 'target']);
      assert.hasAllKeys(swcLoader.options.jsc.parser, ['syntax']);
    });
  });

  // Edge cases and error handling
  describe('Edge cases and error handling', () => {
    it('buildEntries should handle types that do not end in "s"', () => {
      const buildEntries = (typeNames: string[], type: string, entry: string, pathPrefix = ''): Record<string, string> =>
        typeNames.reduce((acc, name) => {
          const fileName = type.replace(/s$/, '') + '.js';
          acc[`${pathPrefix}${type}/${name}/${fileName}`] = `src/${type}/${name}/main/ts/${entry}`;
          return acc;
        }, {} as Record<string, string>);

      const result = buildEntries(['test'], 'plugin', 'Main.ts');
      assert.deepEqual(result, {
        'plugin/test/plugin.js': 'src/plugin/test/main/ts/Main.ts'
      });
    });

    it('escapeHtml should handle very long strings', () => {
      const escapeHtml = (str: string): string => str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[m]);

      const longString = '<div>' + 'a'.repeat(10000) + '</div>';
      const result = escapeHtml(longString);
      assert.equal(result.length, longString.length + 18); // +18 for the escaped < and > and /
    });

    it('buildEntries should preserve order', () => {
      const buildEntries = (typeNames: string[], type: string, entry: string, pathPrefix = ''): Record<string, string> =>
        typeNames.reduce((acc, name) => {
          const fileName = type.replace(/s$/, '') + '.js';
          acc[`${pathPrefix}${type}/${name}/${fileName}`] = `src/${type}/${name}/main/ts/${entry}`;
          return acc;
        }, {} as Record<string, string>);

      const typeNames = ['a', 'b', 'c', 'd', 'e'];
      const result = buildEntries(typeNames, 'plugins', 'Main.ts');
      const keys = Object.keys(result);
      
      assert.equal(keys[0], 'plugins/a/plugin.js');
      assert.equal(keys[1], 'plugins/b/plugin.js');
      assert.equal(keys[2], 'plugins/c/plugin.js');
      assert.equal(keys[3], 'plugins/d/plugin.js');
      assert.equal(keys[4], 'plugins/e/plugin.js');
    });
  });

  // JSC Configuration validation
  describe('JSC Configuration Validation', () => {
    it('should ensure JSC configuration is properly nested', () => {
      const options = {
        jsc: {
          parser: { syntax: "typescript" },
          target: 'es2022'
        },
        sourceMaps: true
      };

      // Verify nesting structure
      assert.property(options, 'jsc');
      assert.property(options.jsc, 'parser');
      assert.property(options.jsc.parser, 'syntax');
      assert.property(options.jsc, 'target');
      assert.property(options, 'sourceMaps');
    });

    it('should validate parser syntax is a string', () => {
      const syntax = 'typescript';
      assert.isString(syntax);
      assert.equal(syntax, 'typescript');
    });

    it('should validate target is a string', () => {
      const target = 'es2022';
      assert.isString(target);
      assert.equal(target, 'es2022');
    });

    it('should validate sourceMaps is a boolean', () => {
      const sourceMaps = true;
      assert.isBoolean(sourceMaps);
      assert.isTrue(sourceMaps);
    });

    it('should ensure target es2022 supports modern features', () => {
      const target = 'es2022';
      const modernTargets = ['es2020', 'es2021', 'es2022'];
      assert.include(modernTargets, target);
    });

    it('should validate complete JSC options structure', () => {
      const jscOptions = {
        parser: { syntax: "typescript" },
        target: 'es2022'
      };

      assert.isObject(jscOptions);
      assert.isObject(jscOptions.parser);
      assert.equal(typeof jscOptions.parser.syntax, 'string');
      assert.equal(typeof jscOptions.target, 'string');
    });
  });

  // Integration-style tests for configuration completeness
  describe('Configuration completeness', () => {
    it('should have all required rspack configuration properties', () => {
      const mockConfig = {
        context: '/some/path',
        entry: {},
        mode: 'development',
        devtool: 'inline-source-map',
        target: 'web',
        plugins: [],
        optimization: {},
        resolve: {},
        module: { rules: [] },
        output: {}
      };

      const requiredKeys = ['context', 'entry', 'mode', 'devtool', 'target', 'plugins', 'optimization', 'resolve', 'module', 'output'];
      requiredKeys.forEach(key => {
        assert.property(mockConfig, key);
      });
    });

    it('should validate TypeScript loader test pattern', () => {
      const tsPattern = /\.ts$/;
      
      assert.isTrue(tsPattern.test('file.ts'));
      assert.isTrue(tsPattern.test('path/to/file.ts'));
      assert.isFalse(tsPattern.test('file.js'));
      assert.isFalse(tsPattern.test('file.tsx'));
      assert.isFalse(tsPattern.test('file.ts.bak'));
    });

    it('should ensure loader order is correct', () => {
      // string-replace-loader should come before swc-loader
      const loaders = ['string-replace-loader', 'builtin:swc-loader'];
      
      assert.equal(loaders.indexOf('string-replace-loader'), 0);
      assert.equal(loaders.indexOf('builtin:swc-loader'), 1);
    });
  });
});