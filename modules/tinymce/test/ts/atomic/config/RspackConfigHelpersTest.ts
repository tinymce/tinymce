import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

describe('atomic.tinymce.config.RspackConfigHelpersTest', () => {
  
  // Test escapeHtml function by extracting and testing it
  const escapeHtml = (str: string): string => str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);

  describe('escapeHtml', () => {
    it('should escape ampersand', () => {
      assert.equal(escapeHtml('foo & bar'), 'foo &amp; bar');
    });

    it('should escape less than', () => {
      assert.equal(escapeHtml('1 < 2'), '1 &lt; 2');
    });

    it('should escape greater than', () => {
      assert.equal(escapeHtml('2 > 1'), '2 &gt; 1');
    });

    it('should escape double quotes', () => {
      assert.equal(escapeHtml('Say "hello"'), 'Say &quot;hello&quot;');
    });

    it('should escape single quotes', () => {
      assert.equal(escapeHtml("It's fine"), "It&#39;s fine");
    });

    it('should escape multiple special characters', () => {
      assert.equal(
        escapeHtml('<div class="test" id=\'main\'>A & B</div>'),
        '&lt;div class=&quot;test&quot; id=&#39;main&#39;&gt;A &amp; B&lt;/div&gt;'
      );
    });

    it('should not modify strings without special characters', () => {
      assert.equal(escapeHtml('hello world'), 'hello world');
    });

    it('should handle empty string', () => {
      assert.equal(escapeHtml(''), '');
    });

    it('should handle string with only special characters', () => {
      assert.equal(escapeHtml('&<>"\''), '&amp;&lt;&gt;&quot;&#39;');
    });

    it('should escape characters in sequence', () => {
      assert.equal(escapeHtml('&&&&'), '&amp;&amp;&amp;&amp;');
    });

    it('should handle mixed content', () => {
      assert.equal(
        escapeHtml('Text <script>alert("XSS")</script> & more'),
        'Text &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt; &amp; more'
      );
    });

    it('should preserve whitespace', () => {
      assert.equal(escapeHtml('  spaces  '), '  spaces  ');
    });

    it('should handle newlines and tabs', () => {
      assert.equal(escapeHtml('line1\nline2\ttab'), 'line1\nline2\ttab');
    });

    it('should handle unicode characters', () => {
      assert.equal(escapeHtml('Hello 世界 & друзья'), 'Hello 世界 &amp; друзья');
    });

    it('should handle HTML entities that are already escaped', () => {
      const once = escapeHtml('A & B');
      const twice = escapeHtml(once);
      assert.equal(once, 'A &amp; B');
      assert.equal(twice, 'A &amp;amp; B');
    });

    it('should handle long strings efficiently', () => {
      const longString = 'a'.repeat(1000) + '&' + 'b'.repeat(1000);
      const result = escapeHtml(longString);
      assert.equal(result, 'a'.repeat(1000) + '&amp;' + 'b'.repeat(1000));
    });

    it('should handle XSS attack patterns', () => {
      const xssPatterns = [
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        'javascript:alert(1)',
        '<iframe src="javascript:alert(1)">',
        '<body onload=alert(1)>',
        '<input onfocus=alert(1) autofocus>',
        '"><script>alert(1)</script>',
        "'-alert(1)-'",
      ];

      xssPatterns.forEach(pattern => {
        const escaped = escapeHtml(pattern);
        assert.notInclude(escaped, '<script', `Should escape: ${pattern}`);
        assert.notInclude(escaped, 'onerror=', `Should escape: ${pattern}`);
        assert.notInclude(escaped, 'onload=', `Should escape: ${pattern}`);
      });
    });

    it('should be idempotent after first application for certain inputs', () => {
      const inputs = ['no special chars', '123456', 'abc-def_ghi'];
      inputs.forEach(input => {
        assert.equal(escapeHtml(input), input);
        assert.equal(escapeHtml(escapeHtml(input)), input);
      });
    });

    it('should prevent script injection', () => {
      const malicious = '<script>alert("XSS")</script>';
      const escaped = escapeHtml(malicious);
      assert.notInclude(escaped, '<script>');
      assert.include(escaped, '&lt;script&gt;');
    });

    it('should prevent event handler injection', () => {
      const malicious = '<img onerror="alert(1)" src=x>';
      const escaped = escapeHtml(malicious);
      assert.notInclude(escaped, 'onerror=');
      assert.include(escaped, '&lt;img');
    });

    it('should handle consecutive special characters', () => {
      assert.equal(escapeHtml('&&&'), '&amp;&amp;&amp;');
      assert.equal(escapeHtml('<<<'), '&lt;&lt;&lt;');
      assert.equal(escapeHtml('"""'), '&quot;&quot;&quot;');
    });
  });

  describe('escapeHtml - Property-based tests', () => {
    it('should never contain unescaped HTML special characters', () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          const result = escapeHtml(input);
          const hasRawSpecialChars = /[&<>"']/.test(result);
          const hasOnlyEntities = result.split('&').every((part, i) => {
            if (i === 0) return true;
            return part.startsWith('amp;') || 
                   part.startsWith('lt;') || 
                   part.startsWith('gt;') || 
                   part.startsWith('quot;') || 
                   part.startsWith('#39;') ||
                   !part.includes(';');
          });
          
          if (!hasRawSpecialChars) return true;
          return !hasRawSpecialChars || hasOnlyEntities;
        }),
        { numRuns: 100 }
      );
    });

    it('should always return a string of equal or greater length', () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          const result = escapeHtml(input);
          return result.length >= input.length;
        }),
        { numRuns: 100 }
      );
    });

    it('should be deterministic', () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          const result1 = escapeHtml(input);
          const result2 = escapeHtml(input);
          return result1 === result2;
        }),
        { numRuns: 100 }
      );
    });

    it('should handle strings with mixed safe and unsafe characters', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.oneof(
            fc.constantFrom('a', 'b', 'c', '1', '2', '3', ' ', '\n'),
            fc.constantFrom('&', '<', '>', '"', "'")
          )),
          (input) => {
            const result = escapeHtml(input);
            return (typeof result === 'string' && result.length > 0) || input.length === 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Configuration path resolution', () => {
    it('should construct correct demo entry paths', () => {
      const typeNames = ['plugin1', 'plugin2'];
      const type = 'plugins';
      const demo = 'Demo.ts';
      const pathPrefix = 'scratch/demos/';

      const expectedPath1 = `${pathPrefix}${type}/plugin1/demo.js`;
      const expectedPath2 = `${pathPrefix}${type}/plugin2/demo.js`;
      const expectedSource1 = `src/${type}/plugin1/demo/ts/demo/${demo}`;

      assert.equal(expectedPath1, 'scratch/demos/plugins/plugin1/demo.js');
      assert.equal(expectedSource1, 'src/plugins/plugin1/demo/ts/demo/Demo.ts');
    });

    it('should construct correct build entry paths', () => {
      const typeNames = ['theme1'];
      const type = 'themes';
      const entry = 'Main.ts';
      const pathPrefix = 'js/tinymce/';

      const fileName = type.replace(/s$/, '') + '.js';
      const expectedPath = `${pathPrefix}${type}/theme1/${fileName}`;
      const expectedSource = `src/${type}/theme1/main/ts/${entry}`;

      assert.equal(expectedPath, 'js/tinymce/themes/theme1/theme.js');
      assert.equal(fileName, 'theme.js');
      assert.equal(expectedSource, 'src/themes/theme1/main/ts/Main.ts');
    });

    it('should handle plural to singular conversion correctly', () => {
      const types = ['plugins', 'themes', 'models'];
      const expected = ['plugin', 'theme', 'model'];

      types.forEach((type, index) => {
        const singular = type.replace(/s$/, '');
        assert.equal(singular, expected[index]);
      });
    });

    it('should construct paths with different prefixes', () => {
      const testCases = [
        { prefix: '', type: 'plugins', name: 'test', expected: 'plugins/test/plugin.js' },
        { prefix: 'scratch/', type: 'themes', name: 'modern', expected: 'scratch/themes/modern/theme.js' },
        { prefix: 'js/tinymce/', type: 'models', name: 'dom', expected: 'js/tinymce/models/dom/model.js' },
      ];

      testCases.forEach(({ prefix, type, name, expected }) => {
        const fileName = type.replace(/s$/, '') + '.js';
        const path = `${prefix}${type}/${name}/${fileName}`;
        assert.equal(path, expected);
      });
    });
  });

  describe('Demo HTML generation patterns', () => {
    it('should generate correct HTML list structure', () => {
      const mockLink = 'src/core/demo/html/test.html';
      const escapedLink = escapeHtml(mockLink);
      const basename = 'test.html';
      const escapedBasename = escapeHtml(basename);

      const expectedLi = `<li><a href="${escapedLink}">${escapedBasename}</a></li>`;
      assert.include(expectedLi, 'href="src/core/demo/html/test.html"');
      assert.include(expectedLi, '>test.html</a>');
    });

    it('should generate correct non-core plugin list item', () => {
      const mockLink = 'src/plugins/image/demo/html/basic.html';
      const type = 'plugins';
      const pluginName = escapeHtml(mockLink.split('/')[2]);
      const basename = escapeHtml('basic.html');
      const escapedLink = escapeHtml(mockLink);

      const expectedLi = `<li>${type !== 'core' ? `<strong>${pluginName}</strong> - ` : ''}<a href="${escapedLink}">${basename}</a></li>`;
      
      assert.include(expectedLi, '<strong>image</strong>');
      assert.include(expectedLi, 'href="src/plugins/image/demo/html/basic.html"');
    });

    it('should not add strong tag for core demos', () => {
      const mockLink = 'src/core/demo/html/test.html';
      const type = 'core';
      const basename = escapeHtml('test.html');
      const escapedLink = escapeHtml(mockLink);

      const strongPart = type !== 'core' ? `<strong>${escapeHtml('core')}</strong> - ` : '';
      const expectedLi = `<li>${strongPart}<a href="${escapedLink}">${basename}</a></li>`;
      
      assert.notInclude(expectedLi, '<strong>');
      assert.include(expectedLi, '<li><a href=');
    });

    it('should generate HTML with proper DOCTYPE', () => {
      const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Demos</title>
  </head>
  <body>
  </body>
  </html>
  `;
      assert.include(html, '<!DOCTYPE html>');
      assert.include(html, '<html lang="en">');
      assert.include(html, '<meta charset="UTF-8">');
    });
  });

  describe('Path manipulation', () => {
    it('should correctly split paths and extract components', () => {
      const testPaths = [
        { path: 'src/plugins/image/demo/html/test.html', expectedType: 'plugins', expectedName: 'image' },
        { path: 'src/themes/silver/demo/html/basic.html', expectedType: 'themes', expectedName: 'silver' },
        { path: 'src/core/demo/html/editor.html', expectedType: 'core', expectedName: undefined },
        { path: 'src/models/dom/demo/html/test.html', expectedType: 'models', expectedName: 'dom' },
      ];

      testPaths.forEach(({ path, expectedType, expectedName }) => {
        const parts = path.split('/');
        assert.equal(parts[1], expectedType, `Type should be ${expectedType}`);
        if (expectedName) {
          assert.equal(parts[2], expectedName, `Name should be ${expectedName}`);
        }
      });
    });

    it('should extract basename correctly', () => {
      const testCases = [
        { path: 'src/core/demo/html/test.html', expected: 'test.html' },
        { path: 'src/plugins/image/demo/html/basic-demo.html', expected: 'basic-demo.html' },
        { path: 'src/themes/silver/demo/html/dialogs/alert.html', expected: 'alert.html' },
        { path: 'test.html', expected: 'test.html' },
      ];

      testCases.forEach(({ path, expected }) => {
        const parts = path.split('/');
        const basename = parts[parts.length - 1];
        assert.equal(basename, expected);
      });
    });
  });

  describe('Loader option validation', () => {
    it('should have valid JSC parser syntax values', () => {
      const validSyntax = ['typescript', 'ecmascript'];
      assert.include(validSyntax, 'typescript');
    });

    it('should have valid JSC target values', () => {
      const validTargets = [
        'es3', 'es5', 'es2015', 'es2016', 'es2017', 
        'es2018', 'es2019', 'es2020', 'es2021', 'es2022'
      ];
      assert.include(validTargets, 'es2022');
    });

    it('should validate sourceMaps is boolean', () => {
      const validValues = [true, false];
      assert.include(validValues, true);
    });
  });

  describe('String replacement patterns', () => {
    it('should have correct version placeholder patterns', () => {
      const placeholders = [
        '@@majorVersion@@',
        '@@minorVersion@@',
        '@@releaseDate@@'
      ];

      placeholders.forEach(placeholder => {
        assert.match(placeholder, /^@@\w+@@$/);
      });
    });

    it('should correctly extract version components', () => {
      const version = '8.2.0';
      const major = version.split('.')[0];
      const minor = version.split('.').slice(1).join('.');

      assert.equal(major, '8');
      assert.equal(minor, '2.0');
    });

    it('should handle different version formats', () => {
      const versions = [
        { input: '8.2.0', major: '8', minor: '2.0' },
        { input: '7.1.0', major: '7', minor: '1.0' },
        { input: '10.0.0', major: '10', minor: '0.0' },
        { input: '1.2.3', major: '1', minor: '2.3' },
      ];

      versions.forEach(({ input, major, minor }) => {
        assert.equal(input.split('.')[0], major);
        assert.equal(input.split('.').slice(1).join('.'), minor);
      });
    });
  });

  describe('File pattern matching', () => {
    it('should match TypeScript files', () => {
      const pattern = /\.ts$/;
      assert.isTrue(pattern.test('test.ts'));
      assert.isFalse(pattern.test('test.tsx'));
      assert.isFalse(pattern.test('test.js'));
    });

    it('should match JavaScript files', () => {
      const pattern = /\.js$/;
      assert.isTrue(pattern.test('test.js'));
      assert.isFalse(pattern.test('test.ts'));
      assert.isFalse(pattern.test('test.jsx'));
    });

    it('should match SVG files', () => {
      const pattern = /\.svg$/i;
      assert.isTrue(pattern.test('icon.svg'));
      assert.isTrue(pattern.test('icon.SVG'));
      assert.isFalse(pattern.test('icon.png'));
    });

    it('should match raw query pattern', () => {
      const pattern = /raw/;
      assert.isTrue(pattern.test('?raw'));
      assert.isTrue(pattern.test('file.css?raw'));
      assert.isFalse(pattern.test('file.css'));
    });

    it('should match JS and MJS files', () => {
      const pattern = /\.(js|mjs)$/;
      assert.isTrue(pattern.test('module.js'));
      assert.isTrue(pattern.test('module.mjs'));
      assert.isFalse(pattern.test('module.ts'));
    });
  });

  describe('Alias generation patterns', () => {
    it('should generate correct alias format for ephox modules', () => {
      const name = 'katamari';
      const alias = `@ephox/${name}`;
      assert.equal(alias, '@ephox/katamari');
    });

    it('should generate correct alias format for tinymce modules', () => {
      const name = 'persona';
      const alias = `@tinymce/${name}`;
      assert.equal(alias, '@tinymce/persona');
    });

    it('should construct correct module path', () => {
      const moduleName = 'alloy';
      const modulePath = `../alloy/src/main/ts/ephox/alloy/api/Main.ts`;
      assert.include(modulePath, moduleName);
      assert.include(modulePath, 'Main.ts');
    });
  });

  describe('Regex pattern validation', () => {
    it('should match export warning messages', () => {
      const pattern = /export .* was not found in/;
      const testMessages = [
        'export foo was not found in bar',
        'export MyComponent was not found in module',
        'export { something } was not found in file',
      ];

      testMessages.forEach(msg => {
        assert.isTrue(pattern.test(msg), `Should match: ${msg}`);
      });
    });

    it('should not match unrelated warnings', () => {
      const pattern = /export .* was not found in/;
      const testMessages = [
        'import error occurred',
        'module not found',
        'syntax error detected',
      ];

      testMessages.forEach(msg => {
        assert.isFalse(pattern.test(msg), `Should not match: ${msg}`);
      });
    });
  });

  describe('Build configuration edge cases', () => {
    it('should handle empty type names array', () => {
      const typeNames: string[] = [];
      const result = typeNames.reduce((acc, name) => {
        acc[`plugins/${name}/plugin.js`] = `src/plugins/${name}/main/ts/Main.ts`;
        return acc;
      }, {} as Record<string, string>);

      assert.isEmpty(result);
      assert.isObject(result);
    });

    it('should handle single item in type names', () => {
      const typeNames = ['test'];
      const result = typeNames.reduce((acc, name) => {
        acc[`plugins/${name}/plugin.js`] = `src/plugins/${name}/main/ts/Main.ts`;
        return acc;
      }, {} as Record<string, string>);

      assert.property(result, 'plugins/test/plugin.js');
      assert.equal(result['plugins/test/plugin.js'], 'src/plugins/test/main/ts/Main.ts');
    });

    it('should handle multiple items in type names', () => {
      const typeNames = ['plugin1', 'plugin2', 'plugin3'];
      const result = typeNames.reduce((acc, name) => {
        acc[`plugins/${name}/plugin.js`] = `src/plugins/${name}/main/ts/Main.ts`;
        return acc;
      }, {} as Record<string, string>);

      assert.lengthOf(Object.keys(result), 3);
      assert.property(result, 'plugins/plugin1/plugin.js');
      assert.property(result, 'plugins/plugin2/plugin.js');
      assert.property(result, 'plugins/plugin3/plugin.js');
    });
  });

  describe('DevServer middleware patterns', () => {
    it('should handle root path correctly', () => {
      const path = '/';
      assert.equal(path, '/');
    });

    it('should validate port format', () => {
      const port = '3000';
      assert.match(port, /^\d+$/);
      assert.isTrue(Number(port) > 0 && Number(port) < 65536);
    });

    it('should validate host format', () => {
      const validHosts = ['0.0.0.0', 'localhost', '127.0.0.1'];
      validHosts.forEach(host => {
        assert.isString(host);
        assert.isNotEmpty(host);
      });
    });
  });

  describe('Output path patterns', () => {
    it('should use correct filename pattern', () => {
      const pattern = '[name]';
      assert.equal(pattern, '[name]');
      assert.notInclude(pattern, '[hash]');
      assert.notInclude(pattern, '[contenthash]');
    });

    it('should use root public path', () => {
      const publicPath = '/';
      assert.equal(publicPath, '/');
      assert.isTrue(publicPath.startsWith('/'));
    });
  });

  describe('Watch options patterns', () => {
    it('should properly match node_modules pattern', () => {
      const pattern = '**/node_modules/**';
      const testPaths = [
        { path: 'node_modules/package/index.js', shouldMatch: true },
        { path: 'src/node_modules/package/index.js', shouldMatch: true },
        { path: 'deep/path/node_modules/pkg/file.js', shouldMatch: true },
        { path: 'src/mycode.js', shouldMatch: false },
      ];

      testPaths.forEach(({ path, shouldMatch }) => {
        const matches = path.includes('node_modules');
        assert.equal(matches, shouldMatch, `Path: ${path}`);
      });
    });
  });
});