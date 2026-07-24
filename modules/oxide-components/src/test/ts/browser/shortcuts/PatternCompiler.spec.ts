import { Fun } from '@ephox/katamari';
import * as PatternCompiler from 'oxide-components/shortcuts/internals/PatternCompiler';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

export interface FakeKeyboardEventConfig {
  readonly key: string;
  readonly code?: string;
  readonly ctrlKey?: boolean;
  readonly metaKey?: boolean;
  readonly shiftKey?: boolean;
  readonly altKey?: boolean;
}

const createFakeKeydownEvent = (config: FakeKeyboardEventConfig): KeyboardEvent => {
  return new KeyboardEvent('keydown', {
    key: config.key,
    code: config.code ?? '',
    ctrlKey: config.ctrlKey ?? false,
    metaKey: config.metaKey ?? false,
    shiftKey: config.shiftKey ?? false,
    altKey: config.altKey ?? false,
    bubbles: true
  });
};

const testPattern = (pattern: string, eventConfig: FakeKeyboardEventConfig, environment: 'mac' | 'other' = 'other') => {
  const matcher = PatternCompiler.compile(pattern, environment === 'mac');
  expect(matcher(createFakeKeydownEvent(eventConfig))).toBe(true);
};

const testPatternFalse = (pattern: string, eventConfig: FakeKeyboardEventConfig, environment: 'mac' | 'other' = 'other') => {
  const matcher = PatternCompiler.compile(pattern, environment === 'mac');
  expect(matcher(createFakeKeydownEvent(eventConfig))).toBe(false);
};

const invalidPatternWarning = (pattern: string) =>
  `Invalid shortcut pattern "${pattern}": valid pattern includes one key and zero or more modifiers`;

describe('browser.shortcuts.PatternCompilerTest', () => {
  describe('Single key shortcuts', () => {
    it('should match Enter key', () => testPattern('Enter', { key: 'Enter' }));
    it('should match Escape key', () => testPattern('Escape', { key: 'Escape' }));
    it('should match Space key', () => testPattern('Space', { key: ' ' }));
    it('should match Tab key', () => testPattern('Tab', { key: 'Tab' }));
    it('should match Backspace key', () => testPattern('Backspace', { key: 'Backspace' }));

    it('should match Enter key insensitive', () => testPattern('enter', { key: 'Enter' }));
    it('should match Escape key insensitive', () => testPattern('escape', { key: 'Escape' }));
    it('should match Space key insensitive', () => testPattern('space', { key: ' ' }));
    it('should match Tab key insensitive', () => testPattern('tab', { key: 'Tab' }));
    it('should match Backspace key insensitive', () => testPattern('backspace', { key: 'Backspace' }));

    describe('Should match arrow keys', () => {
      it('should match arrow up', () => testPattern('ArrowUp', { key: 'ArrowUp' }));
      it('should match arrow down', () => testPattern('ArrowDown', { key: 'ArrowDown' }));
      it('should match arrow left', () => testPattern('ArrowLeft', { key: 'ArrowLeft' }));
      it('should match arrow right', () => testPattern('ArrowRight', { key: 'ArrowRight' }));
      it('should match arrow up key insensitive', () => testPattern('arrowup', { key: 'ArrowUp' }));
    });

    describe('Should match letter keys', () => {
      it('should match a letter', () => testPattern('a', { key: 'a' }));
      it('should match b letter', () => testPattern('b', { key: 'b' }));
    });

    describe('Should match function keys', () => {
      it('should match f1', () => testPattern('F1', { key: 'F1' }));
      it('should match f12', () => testPattern('F12', { key: 'F12' }));
      it('should match f1 key insensitive', () => testPattern('f1', { key: 'F1' }));
    });
  });

  describe('Single modifier', () => {
    it('should match Ctrl+J', () => testPattern('Ctrl+J', { key: 'j', ctrlKey: true }));
    it('should match Meta+J on mac', () => testPattern('Meta+J', { key: 'j', metaKey: true }, 'mac'));
    it('should match Meta+J on non-mac', () => testPattern('Meta+J', { key: 'j', ctrlKey: true }, 'other'));
    it('should match Alt+J', () => testPattern('Alt+J', { key: 'j', altKey: true }));
    it('should match Shift+J', () => testPattern('Shift+J', { key: 'J', shiftKey: true }));

    it('should match Ctrl+Enter', () => testPattern('Ctrl+Enter', { key: 'Enter', ctrlKey: true }));
    it('should match Meta+Enter on mac', () => testPattern('Meta+Enter', { key: 'Enter', metaKey: true }, 'mac'));
    it('should match Meta+Enter on non-mac', () => testPattern('Meta+Enter', { key: 'Enter', ctrlKey: true }, 'other'));

    it('should match ctrl+j case insensitive', () => testPattern('ctrl+j', { key: 'j', ctrlKey: true }));
    it('should match meta+j case insensitive on mac', () => testPattern('meta+j', { key: 'j', metaKey: true }, 'mac'));
    it('should match meta+j case insensitive on non-mac', () => testPattern('meta+j', { key: 'j', ctrlKey: true }, 'other'));
    it('should match alt+j case insensitive', () => testPattern('alt+j', { key: 'j', altKey: true }));
    it('should match shift+j case insensitive', () => testPattern('shift+j', { key: 'J', shiftKey: true }));
  });

  describe('Two modifiers', () => {
    it('should match Ctrl+Alt+K', () => testPattern('Ctrl+Alt+K', { key: 'k', ctrlKey: true, altKey: true }));
    it('should match Ctrl+Shift+L', () => testPattern('Ctrl+Shift+L', { key: 'L', ctrlKey: true, shiftKey: true }));
  });

  describe('event.code fallback for letter/digit keys', () => {
    // On macOS, Option+letter produces a transformed character (e.g. Option+S → 'ß').
    // The compiler should fall back to event.code when event.key doesn't match the pattern.
    it('Ctrl+Alt+S should match on mac when event.key is Option-transformed', () =>
      testPattern('Ctrl+Alt+S', { key: 'ß', code: 'KeyS', ctrlKey: true, altKey: true }, 'mac'));

    it('Ctrl+Alt+K should match when event.key is Option-transformed', () =>
      testPattern('Ctrl+Alt+K', { key: '˚', code: 'KeyK', ctrlKey: true, altKey: true }, 'mac'));

    it('Alt+J should match when event.key is Option-transformed', () =>
      testPattern('Alt+J', { key: '∆', code: 'KeyJ', altKey: true }, 'mac'));

    it('letter shortcuts should match physical key on non-QWERTY layouts', () =>
      testPattern('Ctrl+S', { key: 'o', code: 'KeyS', ctrlKey: true }));

    it('digit shortcut should match Digit code', () =>
      testPattern('Ctrl+Alt+1', { key: '¡', code: 'Digit1', ctrlKey: true, altKey: true }, 'mac'));

    it('digit shortcut should also match Numpad code', () =>
      testPattern('Ctrl+Alt+1', { key: '¡', code: 'Numpad1', ctrlKey: true, altKey: true }, 'mac'));

    it('should not match when modifiers differ even if event.code matches', () =>
      testPatternFalse('Ctrl+Alt+S', { key: 'ß', code: 'KeyS', altKey: true }, 'mac'));

    it('should not fall back for non-letter/digit keys', () =>
      testPatternFalse('Enter', { key: 'X', code: 'Enter' }));
  });

  describe('Strict shortcut matching', () => {
    it('should not match Shift+J when Ctrl is also pressed', () => {
      testPattern('Shift+J', { key: 'J', shiftKey: true });
      testPatternFalse('Shift+J', { key: 'J', shiftKey: true, ctrlKey: true });
    });

    it('should not match Enter when Meta is pressed', () => {
      testPattern('Enter', { key: 'Enter' });
      testPatternFalse('Enter', { key: 'Enter', metaKey: true });
    });
  });

  describe('Meta key mappings', () => {
    describe('Meta key should be CMD on Mac', () => {
      it('Meta+K should match CMD+K on mac', () => testPattern('Meta+K', { key: 'k', metaKey: true }, 'mac'));
      it('Meta+K should not match CTRL+K on mac', () => testPatternFalse('Meta+K', { key: 'k', ctrlKey: true }, 'mac'));
      it('Ctrl + Meta + K should be Control + CMD + K on mac', () => testPattern('Ctrl + Meta + K', { key: 'k', ctrlKey: true, metaKey: true }, 'mac'));
      it('Ctrl + Meta + K should not be squashed into CMD + K on mac', () => testPatternFalse('Ctrl + Meta + K', { key: 'k', metaKey: true }, 'mac'));
    });

    describe('Meta key should be CTRL on non-mac', () => {
      it('Meta+K should not match Win+K on non-mac', () => testPatternFalse('Meta+K', { key: 'k', metaKey: true }, 'other'));
      it('Meta+K should match CTRL+K on non-mac', () => testPattern('Meta+K', { key: 'k', ctrlKey: true }, 'other'));
      it('Ctrl + Meta + K should not be Control + Win + K on non-mac', () => testPatternFalse('Ctrl + Meta + K', { key: 'k', ctrlKey: true, metaKey: true }, 'other'));
      it('Ctrl + Meta + K should be squashed into Ctrl + K on non-mac', () => testPattern('Ctrl + Meta + K', { key: 'k', ctrlKey: true }, 'other'));
    });
  });

  describe('Invalid patterns', () => {
    let warnSpy: MockInstance;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(Fun.noop);
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    const testInvalidPattern = (pattern: string, eventConfig: FakeKeyboardEventConfig) => {
      const matcher = PatternCompiler.compile(pattern);
      expect(warnSpy).toHaveBeenCalledExactlyOnceWith(invalidPatternWarning(pattern));
      expect(matcher(createFakeKeydownEvent(eventConfig))).toBe(false);
    };

    it('should warn and return never-matching function for Ctrl only', () =>
      testInvalidPattern('Ctrl', { key: 'Control', ctrlKey: true }));

    it('should warn and return never-matching function for Meta only', () =>
      testInvalidPattern('Meta', { key: 'Meta', metaKey: true }));

    it('should warn and return never-matching function for Alt only', () =>
      testInvalidPattern('Alt', { key: 'Alt', altKey: true }));

    it('should warn and return never-matching function for Shift only', () =>
      testInvalidPattern('Shift', { key: 'Shift', shiftKey: true }));

    it('should warn and return never-matching function for Alt+Ctrl only', () =>
      testInvalidPattern('Alt+Ctrl', { key: 'Control', ctrlKey: true, altKey: true }));

    it('should warn and return never-matching function for "J+K" (two keys)', () =>
      testInvalidPattern('J+K', { key: 'j' }));

    it('should warn and return never-matching function for "Space+Enter" (two keys)', () =>
      testInvalidPattern('Space+Enter', { key: ' ' }));
  });
});
