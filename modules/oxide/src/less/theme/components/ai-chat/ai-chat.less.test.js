/**
 * Unit tests for ai-chat.less
 * Testing Framework: Bedrock (Mocha + Chai)
 *
 * These tests validate:
 * - CSS custom property definitions and fallbacks
 * - Layout and typography rules for chat UI elements
 * - Gradient, color-mix, and vendor-prefixed styles
 * - Compilation stability across different variable sets
 */

const { expect } = require('chai');
const less = require('less');
const fs = require('fs');
const path = require('path');

describe('ai-chat.less', () => {
  const lessFilePath = path.join(__dirname, 'ai-chat.less');

  const compileLess = async (customPropertiesEnabled = true, overrides = {}) => {
    const lessContent = fs.readFileSync(lessFilePath, 'utf8');
    const baseVars = {
      'background-color': '#ffffff',
      'text-color': '#222222',
      'color-black': '#000000',
      'color-white': '#ffffff',
      'color-error': '#cc0000',
      'pad-sm': '8px',
      'control-border-radius': '4px',
      'panel-border-radius': '6px',
      'font-size-sm': '14px',
      'font-weight-normal': '400',
      'line-height': '18px'
    };
    const globalVars = {
      ...baseVars,
      'custom-properties-enabled': customPropertiesEnabled ? 'true' : 'false',
      ...overrides
    };

    const result = await less.render(lessContent, {
      globalVars,
      math: 'always'
    });

    return result.css;
  };

  let compiledCss;

  before(async () => {
    compiledCss = await compileLess(true);
    expect(compiledCss).to.be.a('string');
  });

  describe('custom property block', () => {
    it('defines custom properties when enabled', async () => {
      const css = await compileLess(true);
      expect(css).to.include('--tox-private-ai-user-prompt-background');
      expect(css).to.include('--tox-private-ai-footer-border-color');
      expect(css).to.match(/--tox-private-ai-user-prompt-background:\s*hsl/);
      expect(css).to.match(/--tox-private-ai-footer-border-color:\s*hsl/);
    });

    it('omits the guarded custom properties when disabled', async () => {
      const css = await compileLess(false);
      expect(css).to.not.match(/\.tox-ai\s*\{[^}]*--tox-private-ai-user-prompt-background/);
      expect(css).to.not.match(/\.tox-ai\s*\{[^}]*--tox-private-ai-footer-border-color/);
    });
  });

  describe('user prompt layout', () => {
    it('configures the prompt container with right-aligned flex layout', () => {
      expect(compiledCss).to.match(/\.tox-ai__user-prompt\s*\{[^}]*display:\s*flex/);
      expect(compiledCss).to.match(/\.tox-ai__user-prompt\s*\{[^}]*flex-direction:\s*column/);
      expect(compiledCss).to.match(/\.tox-ai__user-prompt\s*\{[^}]*margin-left:\s*auto/);
      expect(compiledCss).to.match(/\.tox-ai__user-prompt\s*\{[^}]*gap:\s*inherit/);
      expect(compiledCss).to.match(/\.tox-ai__user-prompt__context\s*\{[^}]*margin-left:\s*auto/);
    });

    it('styles the user prompt text bubble with tokens and fallbacks', () => {
      const block = compiledCss.match(/\.tox-ai__user-prompt__text\s*\{[^}]*\}/s);
      expect(block).to.not.be.null;
      expect(block[0]).to.match(/background-color:\s*var\(--tox-private-ai-user-prompt-background/);
      expect(block[0]).to.match(/padding:\s*var\(--tox-private-pad-sm/);
      expect(block[0]).to.match(/border-radius:\s*var\(--tox-private-control-border-radius/);
      expect(block[0]).to.match(/max-width:\s*80%/);
      expect(block[0]).to.match(/align-self:\s*flex-end/);
      expect(block[0]).to.match(/color:\s*var\(--tox-private-text-color/);
    });
  });

  describe('scroll container', () => {
    it('enables scrolling with consistent spacing and alignment', () => {
      const block = compiledCss.match(/\.tox-ai__scroll\s*\{[^}]*\}/s);
      expect(block).to.not.be.null;
      expect(block[0]).to.match(/overflow:\s*auto/);
      expect(block[0]).to.match(/background-color:\s*var\(--tox-private-background-color/);
      expect(block[0]).to.match(/display:\s*flex/);
      expect(block[0]).to.match(/flex-direction:\s*column/);
      expect(block[0]).to.match(/padding:\s*12px/);
      expect(block[0]).to.match(/align-items:\s*flex-start/);
      expect(block[0]).to.match(/gap:\s*12px/);
      expect(block[0]).to.match(/flex:\s*1\s+0\s+0/);
      expect(block[0]).to.match(/align-self:\s*stretch/);
    });
  });

  describe('response content', () => {
    it('applies typography settings for AI responses', () => {
      const block = compiledCss.match(/\.tox-ai__response-content\s*\{[^}]*\}/s);
      expect(block).to.not.be.null;
      expect(block[0]).to.match(/padding:\s*var\(--tox-private-pad-sm/);
      expect(block[0]).to.match(/color:\s*var\(--tox-private-text-color/);
      expect(block[0]).to.match(/font-feature-settings:\s*'liga'\s*off,\s*'clig'\s*off/);
      expect(block[0]).to.match(/font-size:\s*var\(--tox-private-font-size-sm/);
      expect(block[0]).to.match(/font-style:\s*normal/);
      expect(block[0]).to.match(/font-weight:\s*var\(--tox-private-font-weight-normal/);
      expect(block[0]).to.match(/line-height:\s*var\(--tox-private-line-height,\s*18px\)/);
      expect(block[0]).to.match(/white-space:\s*pre-wrap/);
    });
  });

  describe('streaming response state', () => {
    it('renders gradient text with vendor-prefixed clipping', () => {
      const block = compiledCss.match(/\.tox-ai__response\.tox-ai__response-streaming\s*\{[^}]*\}/s);
      expect(block).to.not.be.null;
      expect(block[0]).to.match(/background:\s*linear-gradient\(180deg/);
      expect(block[0]).to.match(/color-mix\(in\s+srgb/);
      expect(block[0]).to.match(/background-clip:\s*text/);
      expect(block[0]).to.match(/-webkit-background-clip:\s*text/);
      expect(block[0]).to.match(/-webkit-text-fill-color:\s*transparent/);
    });
  });

  describe('error messaging', () => {
    it('applies bordered gradient styling for error states', () => {
      const block = compiledCss.match(/\.tox-ai__error-message\s*\{[^}]*\}/s);
      expect(block).to.not.be.null;
      expect(block[0]).to.match(/border-radius:\s*var\(--tox-private-panel-border-radius/);
      expect(block[0]).to.match(/border:\s*1px\s+solid\s+var\(--tox-private-color-error/);
      expect(block[0]).to.match(/background:\s*linear-gradient\(0deg/);
      expect(block[0]).to.match(/color-mix\(in\s+srgb/);
      expect(block[0]).to.match(/padding:\s*var\(--tox-private-pad-sm/);
      expect(block[0]).to.match(/width:\s*100%/);
    });
  });

  describe('footer layout', () => {
    it('defines footer structure and spacing', () => {
      const block = compiledCss.match(/\.tox-ai__footer\s*\{[^}]*\}/s);
      expect(block).to.not.be.null;
      expect(block[0]).to.match(/border-top:\s*1px\s+solid/);
      expect(block[0]).to.match(/padding:\s*12px/);
      expect(block[0]).to.match(/gap:\s*var\(--tox-private-pad-sm/);
      expect(block[0]).to.match(/background-color:\s*var\(--tox-private-background-color/);
      expect(block[0]).to.match(/display:\s*flex/);
      expect(block[0]).to.match(/flex-direction:\s*column/);
    });

    it('provides horizontal layout for footer actions', () => {
      const block = compiledCss.match(/\.tox-ai__footer-actions\s*\{[^}]*\}/s);
      expect(block).to.not.be.null;
      expect(block[0]).to.match(/display:\s*flex/);
      expect(block[0]).to.match(/gap:\s*var\(--tox-private-pad-sm/);
    });
  });

  describe('CSS variable fallbacks', () => {
    it('supplies fallbacks for critical custom properties', () => {
      expect(compiledCss).to.match(/var\(--tox-private-ai-user-prompt-background,\s*darken/);
      expect(compiledCss).to.match(/var\(--tox-private-ai-footer-border-color,\s*darken/);
      expect(compiledCss).to.match(/var\(--tox-private-pad-sm,\s*@pad-sm\)/);
      expect(compiledCss).to.match(/var\(--tox-private-control-border-radius,\s*@control-border-radius\)/);
      expect(compiledCss).to.match(/var\(--tox-private-text-color,\s*@text-color\)/);
    });
  });

  describe('selector conventions', () => {
    it('keeps all selectors scoped under the tox-ai namespace', () => {
      const selectors = compiledCss.match(/\.tox-ai[^{]*\{/g) || [];
      expect(selectors).to.not.be.empty;
      selectors.forEach((selector) => {
        expect(selector.trim()).to.match(/^\.tox-ai/);
      });
    });

    it('retains BEM-style class names for subcomponents', () => {
      expect(compiledCss).to.include('.tox-ai__user-prompt');
      expect(compiledCss).to.include('.tox-ai__user-prompt__context');
      expect(compiledCss).to.include('.tox-ai__user-prompt__text');
      expect(compiledCss).to.include('.tox-ai__scroll');
      expect(compiledCss).to.include('.tox-ai__response-content');
      expect(compiledCss).to.include('.tox-ai__error-message');
      expect(compiledCss).to.include('.tox-ai__footer');
      expect(compiledCss).to.include('.tox-ai__footer-actions');
    });
  });

  describe('compilation resilience', () => {
    it('produces non-empty CSS output with defaults', () => {
      expect(compiledCss.length).to.be.greaterThan(100);
    });

    it('compiles when custom properties are disabled', async () => {
      const css = await compileLess(false);
      expect(css).to.be.a('string');
      expect(css.length).to.be.greaterThan(100);
    });

    it('supports variable overrides without errors', async () => {
      const css = await compileLess(true, {
        'background-color': '#f0f0f0',
        'pad-sm': '10px'
      });
      expect(css).to.be.a('string');
      expect(css).to.include('#f0f0f0');
      expect(css).to.include('10px');
    });
  });

  describe('sanity checks', () => {
    it('does not leak LESS-specific syntax into compiled CSS', () => {
      expect(compiledCss).to.not.match(/@[a-z0-9-]+:/i);
      expect(compiledCss).to.not.include('when (');
      expect(compiledCss).to.not.match(/\.\([^)]*\)/);
    });
  });

  describe('browser compatibility features', () => {
    it('includes vendor-prefixed properties for text rendering', () => {
      expect(compiledCss).to.include('-webkit-background-clip');
      expect(compiledCss).to.include('-webkit-text-fill-color');
    });

    it('uses modern gradient and color-mix syntax', () => {
      expect(compiledCss).to.match(/linear-gradient\(180deg/);
      expect(compiledCss).to.match(/linear-gradient\(0deg/);
      expect(compiledCss).to.match(/color-mix\(in\s+srgb/);
    });
  });

  describe('layout metrics', () => {
    it('employs flexbox consistently across the component', () => {
      const matches = compiledCss.match(/display:\s*flex/g) || [];
      expect(matches.length).to.be.at.least(4);
    });

    it('reuses the 12px spacing token for consistent rhythm', () => {
      const matches = compiledCss.match(/gap:\s*12px/g) || [];
      expect(matches.length).to.be.at.least(1);
      expect(compiledCss).to.include('padding: 12px;');
    });
  });
});