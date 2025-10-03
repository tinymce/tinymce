/**
 * Tests for tag.less
 * Framework: Mocha (describe/it) with Node.js assert
 * Notes: Repo uses Bedrock (mocha-based) and Chai; we use assert to avoid new deps.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('LESS: theme/components/tag/tag.less', () => {
  let lessContent = '';
  const lessPath = path.join(__dirname, 'tag.less');

  before(() => {
    assert.ok(fs.existsSync(lessPath), 'Expected tag.less to exist next to this test file');
    lessContent = fs.readFileSync(lessPath, 'utf8');
    assert.ok(lessContent.length > 0, 'LESS content should not be empty');
  });

  describe('Structure & nesting', () => {
    it('contains .tox namespace with nested .tox-tag', () => {
      const re = /\.tox\s*\{[\s\S]*?\.tox-tag\s*\{/m;
      assert.ok(re.test(lessContent), 'Expected .tox { ... .tox-tag { ... } nesting');
    });
    it('contains BEM elements for icon and close', () => {
      assert.ok(lessContent.includes('.tox-tag__icon'), 'Missing .tox-tag__icon');
      assert.ok(lessContent.includes('.tox-tag__close'), 'Missing .tox-tag__close');
    });
    it('contains modifier class for icon buttons', () => {
      assert.ok(lessContent.includes('.tox-button--icon'), 'Missing .tox-button--icon');
    });
  });

  describe('Tag container properties', () => {
    it('uses width: fit-content', () => {
      assert.ok(/width:\s*fit-content\s*;/.test(lessContent));
    });
    it('uses display: flex and gap', () => {
      assert.ok(/display:\s*flex\s*;/.test(lessContent));
      assert.ok(/gap:\s*4px\s*;/.test(lessContent));
    });
    it('sets padding and border-radius', () => {
      assert.ok(/padding:\s*4px\s+6px\s*;/.test(lessContent));
      assert.ok(/border-radius:\s*3px\s*;/.test(lessContent));
    });
    it('uses linear-gradient with color-mix and tint layer', () => {
      assert.ok(/background:\s*linear-gradient\(0deg/.test(lessContent), 'Missing linear-gradient(0deg)');
      assert.ok(/color-mix\(in\s+srgb,\s*var\(--tox-private-color-white,\s*@color-white\)\s*90%,\s*transparent\)/.test(lessContent), 'Missing color-mix with white var fallback');
      assert.ok(/--tox-private-color-tint,\s*@color-tint\)/.test(lessContent), 'Missing tint fallback');
    });
    it('uses CSS custom properties with LESS fallbacks for line-height and font-size', () => {
      assert.ok(/line-height:\s*var\(--tox-private-base-value,\s*@base-value\)\s*;/.test(lessContent));
      assert.ok(/font-size:\s*var\(--tox-private-font-size-xs,\s*@font-size-xs\)\s*;/.test(lessContent));
    });
  });

  describe('Icon and close button styles', () => {
    it('icon height uses base-value fallback', () => {
      const re = /\.tox-tag__icon\s*\{[\s\S]*?height:\s*var\(--tox-private-base-value,\s*@base-value\)\s*;[\s\S]*?\}/m;
      assert.ok(re.test(lessContent), 'Icon height should use base-value with fallback');
    });
    it('close height uses base-value fallback', () => {
      const re = /\.tox-tag__close\s*\{[\s\S]*?height:\s*var\(--tox-private-base-value,\s*@base-value\)\s*;[\s\S]*?\}/m;
      assert.ok(re.test(lessContent), 'Close height should use base-value with fallback');
    });
    it('nested icon button removes border and padding', () => {
      const re = /\.tox-tag__close[\s\S]*?\.tox-button\.tox-button--icon\s*\{[\s\S]*?border:\s*0\s*;[\s\S]*?padding:\s*0\s*;[\s\S]*?\}/m;
      assert.ok(re.test(lessContent), 'Expected border: 0 and padding: 0 on nested icon button');
    });
    it('::before pseudo-element removes box-shadow', () => {
      const re = /&::before\s*\{[\s\S]*?box-shadow:\s*none\s*;[\s\S]*?\}/m;
      assert.ok(re.test(lessContent), 'Expected box-shadow: none on ::before');
    });
  });
});