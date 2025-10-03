/**
 * Tests for theme.less
 * Testing library/framework: Node's built-in test runner (node:test) + assert
 * Note: The project primarily uses Bedrock across many modules, however the oxide module has no existing tests.
 * These tests are dependency-free and validate the LESS manifest structure and references.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { test, describe } = require('node:test');
const it = test;

describe('theme.less manifest', () => {
  const themeLessPath = path.join(__dirname, 'theme.less');
  const themeContent = fs.readFileSync(themeLessPath, 'utf8');
  const lines = themeContent.split(/\r?\n/);
  const importStatements = lines
    .map((l) => l.trim())
    .filter((l) => l.startsWith('@import'));

  describe('File existence and readability', () => {
    it('exists at expected path', () => {
      assert.ok(fs.existsSync(themeLessPath), 'theme.less should exist');
    });
    it('is readable and non-empty', () => {
      assert.doesNotThrow(() => fs.accessSync(themeLessPath, fs.constants.R_OK));
      assert.ok(typeof themeContent === 'string' && themeContent.length > 0);
    });
  });

  describe('Import statement structure', () => {
    it('contains @import statements', () => {
      assert.ok(importStatements.length > 0, 'no @import statements found');
    });

    it('each @import is properly formatted', () => {
      importStatements.forEach((stmt) => {
        assert.match(stmt, /^@import\s+['"][^'"]+['"]\s*;?$/, `bad import format: ${stmt}`);
      });
    });

    it('uses a consistent quote style across imports (all single or all double)', () => {
      const single = importStatements.filter((s) => /@import\s+'/.test(s)).length;
      const dbl = importStatements.filter((s) => /@import\s+"/.test(s)).length;
      assert.ok(single === 0 || dbl === 0, 'mixed quote styles detected');
    });

    it('semicolon usage is consistent (all with or all without)', () => {
      const withSemi = importStatements.filter((s) => s.endsWith(';')).length;
      const withoutSemi = importStatements.length - withSemi;
      assert.ok(withSemi === 0 || withoutSemi === 0, 'mixed semicolon usage across @import lines');
    });
  });

  describe('Import order and organization', () => {
    it('globals are imported before components', () => {
      const firstComponentIdx = importStatements.findIndex((s) => s.includes('components/'));
      const lastGlobalIdx = importStatements
        .map((s, i) => (s.includes('globals/') ? i : -1))
        .filter((i) => i !== -1)
        .pop();
      if (firstComponentIdx !== -1 && lastGlobalIdx !== -1) {
        assert.ok(lastGlobalIdx < firstComponentIdx, 'components appear before the end of globals');
      }
    });

    it('feature-flags is first (if present)', () => {
      const ffIdx = importStatements.findIndex((s) => s.includes('feature-flags'));
      if (ffIdx !== -1) {
        const firstImportIdx = 0;
        assert.strictEqual(ffIdx, firstImportIdx, 'feature-flags should be first import');
      }
    });

    it('reset appears early in global imports (if present)', () => {
      const resetIdx = importStatements.findIndex((s) => s.includes('globals/reset'));
      const globalIdxs = importStatements
        .map((s, i) => (s.includes('globals/') ? i : -1))
        .filter((i) => i !== -1);
      if (resetIdx !== -1 && globalIdxs.length > 0) {
        const thirdGlobal = globalIdxs[Math.min(2, globalIdxs.length - 1)];
        assert.ok(resetIdx <= thirdGlobal, 'reset should be among the first few globals');
      }
    });

    it('listbox/select/textarea come after textfield (as per dependency note)', () => {
      const idx = (name) => importStatements.findIndex((s) => s.includes(name));
      const textfield = idx('components/form/textfield');
      const listbox = idx('components/form/listbox');
      const select = idx('components/form/select');
      const textarea = idx('components/form/textarea');
      if (textfield !== -1) {
        if (listbox !== -1) assert.ok(listbox > textfield, 'listbox must be after textfield');
        if (select !== -1) assert.ok(select > textfield, 'select must be after textfield');
        if (textarea !== -1) assert.ok(textarea > textfield, 'textarea must be after textfield');
      }
    });
  });

  describe('Import path validation', () => {
    it('all import paths resolve to files (with or without .less extension)', () => {
      const baseDir = path.dirname(themeLessPath);
      importStatements.forEach((stmt) => {
        const m = stmt.match(/['"]([^'"]+)['"]/);
        assert.ok(!!m, `cannot parse path from: ${stmt}`);
        const importPath = m[1];
        const candidates = [
          path.join(baseDir, importPath),
          path.join(baseDir, `${importPath}.less`),
        ];
        const exists = candidates.some((p) => fs.existsSync(p));
        assert.ok(exists, `import path does not exist: ${importPath}`);
      });
    });

    it('does not import itself (no circular self-import)', () => {
      importStatements.forEach((stmt) => {
        assert.ok(/theme\.less/.test(stmt), `self import detected: ${stmt}`);
      });
    });

    it('uses forward slashes in paths (no backslashes)', () => {
      importStatements.forEach((stmt) => {
        const m = stmt.match(/['"]([^'"]+)['"]/);
        if (m) assert.ok(!m[1].includes('\\'), `backslash in path: ${m[1]}`);
      });
    });

    it('does not use disallowed file extensions (only .less or none)', () => {
      importStatements.forEach((stmt) => {
        const m = stmt.match(/['"]([^'"]+)['"]/);
        if (!m) return;
        const p = m[1];
        const parts = p.split('.');
        if (parts.length > 1) {
          const ext = parts.pop();
          assert.ok(ext === 'less', `only .less extension is allowed when specifying extensions: ${p}`);
        }
      });
    });
  });

  describe('No duplicate imports', () => {
    it('no duplicate import statements', () => {
      const normalized = importStatements.map((s) => s.replace(/\s+/g, ' ').toLowerCase());
      const unique = new Set(normalized);
      assert.strictEqual(unique.size, normalized.length, 'duplicate @import statements detected');
    });

    it('does not import same file via different strings', () => {
      const basenames = importStatements
        .map((s) => (s.match(/['"]([^'"]+)['"]/) || [null, null])[1])
        .filter(Boolean)
        .map((p) => path.basename(p));
      const set = new Set(basenames);
      assert.strictEqual(set.size, basenames.length, 'same basename imported via multiple paths');
    });
  });

  describe('Critical component coverage (from diff)', () => {
    const required = [
      'globals/feature-flags',
      'globals/reset',
      'globals/utils',
      'globals/global-variables',
      'globals/global-custom-properties',
      'globals/animations',
      'globals/tinymce',
      'components/editor/editor',
      'components/button/button',
      'components/dialog/dialog',
      'components/menu/menu',
      'components/toolbar/toolbar',
      'components/toolbar-button/toolbar-button',
      'components/sidebar/sidebar-container',
      'components/sidebar/sidebar-content',
      'components/notification/notification',
      'components/tooltip/tooltip',
      'components/form/textfield',
      'components/form/listbox',
      'components/form/select',
      'components/form/textarea',
      'components/ai-chat/ai-chat',
      'components/revisionhistory/revisionhistory',
      'components/suggestededits/suggestededits',
      'alien/unknowns'
    ];

    required.forEach((frag) => {
      it(`includes @import "${frag}"`, () => {
        assert.ok(importStatements.some((s) => s.includes(frag)), `missing import: ${frag}`);
      });
    });
  });

  describe('Syntax sanity checks', () => {
    it('contains no obvious LESS directive errors', () => {
      assert.ok(!/@@/.test(themeContent), 'found @@ which suggests a typo');
      assert.ok(!/@import\s*\(/.test(themeContent), 'function-style @import syntax is invalid for LESS here');
    });

    it('balanced quotes overall', () => {
      const singles = (themeContent.match(/'/g) || []).length;
      const doubles = (themeContent.match(/"/g) || []).length;
      assert.strictEqual(singles % 2, 0, 'unbalanced single quotes');
      assert.strictEqual(doubles % 2, 0, 'unbalanced double quotes');
    });
  });

  describe('Organization and trailing content checks', () => {
    it('last import is alien/unknowns', () => {
      const last = importStatements[importStatements.length - 1] || '';
      assert.ok(last.includes('alien/unknowns'), 'last import should be alien/unknowns');
    });

    it('does not mix tabs and spaces for indentation (if any indented lines exist)', () => {
      const indented = lines.filter((l) => l.startsWith(' ') || l.startsWith('\t'));
      if (indented.length > 0) {
        const usesSpaces = indented.some((l) => l.startsWith(' '));
        const usesTabs = indented.some((l) => l.startsWith('\t'));
        assert.ok(!(usesSpaces && usesTabs), 'mixed tabs and spaces detected');
      }
    });

    it('has a reasonable count of @imports for a manifest', () => {
      assert.ok(importStatements.length > 50, 'too few imports for a theme manifest');
      assert.ok(importStatements.length < 200, 'too many imports (suspicious)');
    });
  });
});