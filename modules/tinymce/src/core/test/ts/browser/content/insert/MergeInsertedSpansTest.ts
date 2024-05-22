import { describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Obj } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as InsertContent from 'tinymce/core/content/InsertContent';

describe('browser.tinymce.core.content.insert.MergeInsertedSpansTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, [], true);

  const red = '#ff0000';
  const green = '#00ff00';
  const blue = '#0000ff';

  const buildInlineStyles = (inlineStyles: Record<string, string>) => Obj.mapToArray(inlineStyles, (value, style) => `${style}: ${value};`);
  const buildNestedInlineElements = (type: string, spans: Record<string, string>[], text: string): string =>
    Arr.foldr(spans, (acc, inlineStyles) => `<${type} style="${buildInlineStyles(inlineStyles).join(' ')}">${acc}</span>`, text);
  const buildNestedSpans = Fun.curry(buildNestedInlineElements, 'span');

  const testMergeNestedSpans = (initial: string, inserted: string, expected: string, path: number[], offset: number) => {
    const editor = hook.editor();
    editor.setContent(`<p>${initial}</p>`);
    TinySelections.setCursor(editor, path, offset);
    InsertContent.insertAtCaret(editor, {
      content: inserted,
      merge: true
    });
    TinyAssertions.assertContent(editor, `<p>${expected}</p>`);
  };

  Arr.each([ 'color', 'background-color' ], (style) => {
    it('TINY-10869: Merging one styled span inserted into span with same style', () => {
      const initial = buildNestedSpans([{ [style]: red }], 'test');
      const inserted = buildNestedSpans([{ [style]: red }], 'test');
      const expected = buildNestedSpans([{ [style]: red }], 'tetestst');
      testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0 ], 2);
    });

    it('TINY-10869: Merging one different styled span inserted into initial span', () => {
      const initial = buildNestedSpans([{ [style]: red }], 'test');
      const inserted = buildNestedSpans([{ [style]: blue }], 'test');
      const expected = buildNestedSpans([{ [style]: red }], `te${inserted}st`);
      testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0 ], 2);
    });

    it('TINY-10869: Merging one different and one identical styled spans inserted into initial spans', () => {
      const initial = buildNestedSpans([{ [style]: red }, { [style]: green }], 'test');
      const inserted = buildNestedSpans([{ [style]: blue }, { [style]: red }], 'test');
      const expected = buildNestedSpans([{ [style]: red }, { [style]: green }], `te${buildNestedSpans([{ [style]: blue }], 'test')}st`);
      testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
    });

    it('TINY-10869: Merging two different styled spans inserted into initial spans', () => {
      const initial = buildNestedSpans([{ [style]: red }, { [style]: green }], 'test');
      const inserted = buildNestedSpans([{ [style]: '#000000' }, { [style]: blue }], 'test');
      const expected = buildNestedSpans([{ [style]: red }, { [style]: green }], `te${inserted}st`);
      testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
    });

    it('TINY-10869: Merging three identical styled spans inserted into initial spans', () => {
      const initial = buildNestedSpans([{ [style]: red }, { [style]: green }, { [style]: blue }], 'test');
      const inserted = buildNestedSpans([{ [style]: red }, { [style]: green }, { [style]: blue }], 'test');
      const expected = buildNestedSpans([{ [style]: red }, { [style]: green }, { [style]: blue }], 'tetestst');
      testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0, 0 ], 2);
    });
  });

  it('TINY-10869: Merging one styled spans inserted into different styled initial span', () => {
    const initial = buildNestedSpans([{ ['color']: red }], 'test');
    const inserted = buildNestedSpans([{ ['background-color']: blue }], 'test');
    const expected = buildNestedSpans([{ ['color']: red }], `te${inserted}st`);
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging two spans of same style into two different styled initial spans', () => {
    const initial = buildNestedSpans([{ ['color']: red }, { ['color']: green }], 'test');
    const inserted = buildNestedSpans([{ ['background-color']: blue }, { ['background-color']: red }], 'test');
    const expected = buildNestedSpans([{ ['color']: red }, { ['color']: green }], `te${inserted}st`);
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging two different styled spans inserted into two identical styled initial spans', () => {
    const initial = buildNestedSpans([{ ['color']: red }, { ['background-color']: green }], 'test');
    const inserted = buildNestedSpans([{ ['color']: red }, { ['background-color']: green }], 'test');
    const expected = buildNestedSpans([{ ['color']: red }, { ['background-color']: green }], 'tetestst');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging two different styled spans inserted into two different styled initial spans', () => {
    const initial = buildNestedSpans([{ ['color']: red }, { ['background-color']: green }], 'test');
    const inserted = buildNestedSpans([{ ['background-color']: blue }, { ['color']: green }], 'test');
    const expected = buildNestedSpans([{ ['color']: red }, { ['background-color']: green }], `te${inserted}st`);
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging four different styled spans inserted into four different styled initial spans, with some spans identical', () => {
    const initial = buildNestedSpans([
      { ['color']: red },
      { ['color']: green },
      { ['background-color']: green },
      { ['background-color']: blue }
    ], 'test');
    const inserted = buildNestedSpans([
      { ['background-color']: blue },
      { ['background-color']: red },
      { ['color']: red },
      { ['color']: blue },
    ], 'test');
    const expectedInserted = buildNestedSpans([
      { ['background-color']: red },
      { ['color']: blue },
    ], 'test');
    const expected = buildNestedSpans([
      { ['color']: red },
      { ['color']: green },
      { ['background-color']: green },
      { ['background-color']: blue },
    ], 'te' + expectedInserted + 'st');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging span with two styles inserted into initial span with different styles', () => {
    const initial = buildNestedSpans([{ ['color']: blue, ['background-color']: red }], 'test');
    const inserted = buildNestedSpans([{ ['color']: red, ['background-color']: blue }], 'test');
    const expected = buildNestedSpans([{ ['color']: blue, ['background-color']: red }], `te${inserted}st`);
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging span with two styles inserted into initial span with identical styles', () => {
    const initial = buildNestedSpans([{ ['color']: blue, ['background-color']: red }], 'test');
    const inserted = initial;
    const expected = buildNestedSpans([{ ['color']: blue, ['background-color']: red }], 'tetestst');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging two nested spans with different styles inserted into one initial span with same style as one span', () => {
    const initial = buildNestedSpans([{ ['color']: blue, ['background-color']: red }], 'test');
    const inserted = buildNestedSpans([
      { ['color']: red, ['background-color']: blue },
      { ['color']: blue, ['background-color']: red }
    ], 'test');
    const expectedInserted = buildNestedSpans([{ ['color']: red, ['background-color']: blue }], 'test');
    const expected = buildNestedSpans([{ ['color']: blue, ['background-color']: red }], `te${expectedInserted}st`);
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging two nested spans with different styles inserted into one initial span with same style as one span but different order', () => {
    const initial = buildNestedSpans([{ ['color']: blue, ['background-color']: red }], 'test');
    const inserted = buildNestedSpans([
      { ['color']: red, ['background-color']: blue },
      { ['background-color']: red, ['color']: blue }
    ], 'test');
    const expectedInserted = buildNestedSpans([{ ['color']: red, ['background-color']: blue }], 'test');
    const expected = buildNestedSpans([{ ['color']: blue, ['background-color']: red }], `te${expectedInserted}st`);
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging two nested spans with different styles inserted into one initial span with both styles', () => {
    const initial = buildNestedSpans([{ ['color']: blue, ['background-color']: red }], 'test');
    const inserted = buildNestedSpans([{ ['color']: blue }, { ['background-color']: red }], 'test');
    const expected = buildNestedSpans([{ ['color']: blue, ['background-color']: red }], `te${inserted}st`);
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging one span with two styles into nested spans each with one same style', () => {
    const initial = buildNestedSpans([{ ['color']: blue }, { ['background-color']: red }], 'test');
    const inserted = buildNestedSpans([{ ['color']: blue, ['background-color']: red }], 'test');
    const expected = buildNestedSpans([{ ['color']: blue }, { ['background-color']: red }], `te${inserted}st`);
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging two spans with different styles into two nested spans with matching styles', () => {
    const initial = buildNestedSpans([
      { ['color']: red, ['background-color']: blue },
      { ['background-color']: red, ['color']: blue }
    ], 'test');
    const inserted = buildNestedSpans([
      { ['color']: red, ['background-color']: blue },
      { ['background-color']: red, ['color']: blue }
    ], 'test');
    const expected = buildNestedSpans([
      { ['color']: red, ['background-color']: blue },
      { ['background-color']: red, ['color']: blue }
    ], 'tetestst');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging two spans with different styles into two nested spans with matching styles but reversed order', () => {
    const initial = buildNestedSpans([
      { ['color']: red, ['background-color']: blue },
      { ['background-color']: red, ['color']: blue }
    ], 'test');
    const inserted = buildNestedSpans([
      { ['background-color']: red, ['color']: blue },
      { ['color']: red, ['background-color']: blue }
    ], 'test');
    const expected = buildNestedSpans([
      { ['color']: red, ['background-color']: blue },
      { ['background-color']: red, ['color']: blue }
    ], 'tetestst');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
  });
});
