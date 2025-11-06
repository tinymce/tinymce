import * as Bem from 'oxide-components/utils/Bem';
import { describe, expect, it } from 'vitest';

describe('browser.utils.BemTest', () => {
  describe('block', () => {
    it('block without modifiers', () => {
      expect(Bem.block('tox-tinymce')).toBe('tox-tinymce');
      expect(Bem.block('tox-toolbar')).toBe('tox-toolbar');
    });

    it('block with modifiers', () => {
      expect(Bem.block('tox-toolbar', { 'scrolling': true, 'no-divider': true })).toBe('tox-toolbar tox-toolbar--scrolling tox-toolbar--no-divider');
      expect(Bem.block('tox-toolbar', { 'scrolling': false, 'no-divider': true })).toBe('tox-toolbar tox-toolbar--no-divider');
    });

    it('block with modifiers in reversed order', () => {
      expect(Bem.block('tox-toolbar', { 'no-divider': true, 'scrolling': true })).toBe('tox-toolbar tox-toolbar--no-divider tox-toolbar--scrolling');
    });
  });

  describe('element', () => {
    it('element without modifiers', () => {
      expect(Bem.element('tox-form', 'group')).toBe('tox-form__group');
    });

    it('element with modifiers', () => {
      expect(Bem.element('tox-form', 'group', { error: true, inline: true })).toBe('tox-form__group tox-form__group--error tox-form__group--inline');
      expect(Bem.element('tox-form', 'group', { error: false, inline: true })).toBe('tox-form__group tox-form__group--inline');
    });

    it('element with modifiers in reversed order', () => {
      expect(Bem.element('tox-form', 'group', { inline: true, error: true })).toBe('tox-form__group tox-form__group--inline tox-form__group--error');
    });
  });

  describe('blockSelector', () => {
    it('block selector without modifiers', () => {
      expect(Bem.blockSelector('tox-tinymce')).toBe('.tox-tinymce');
    });

    it('block selector with modifiers', () => {
      expect(Bem.blockSelector('tox-toolbar', { 'scrolling': true, 'no-divider': true })).toBe('.tox-toolbar.tox-toolbar--scrolling.tox-toolbar--no-divider');
      expect(Bem.blockSelector('tox-toolbar', { 'scrolling': false, 'no-divider': true })).toBe('.tox-toolbar.tox-toolbar--no-divider');
    });

    it('block selector with modifiers in reversed order', () => {
      expect(Bem.blockSelector('tox-toolbar', { 'no-divider': true, 'scrolling': true })).toBe('.tox-toolbar.tox-toolbar--no-divider.tox-toolbar--scrolling');
    });
  });

  describe('elementSelector', () => {
    it('element selector without modifiers', () => {
      expect(Bem.elementSelector('tox-form', 'group')).toBe('.tox-form__group');
    });

    it('element selector with modifiers', () => {
      expect(Bem.elementSelector('tox-form', 'group', { error: true, inline: true })).toBe('.tox-form__group.tox-form__group--error.tox-form__group--inline');
      expect(Bem.elementSelector('tox-form', 'group', { error: false, inline: true })).toBe('.tox-form__group.tox-form__group--inline');
    });

    it('element selector with modifiers in reversed order', () => {
      expect(Bem.elementSelector('tox-form', 'group', { inline: true, error: true })).toBe('.tox-form__group.tox-form__group--inline.tox-form__group--error');
    });
  });
});
