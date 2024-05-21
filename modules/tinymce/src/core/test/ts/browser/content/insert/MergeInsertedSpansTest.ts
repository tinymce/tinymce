import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as InsertContent from 'tinymce/core/content/InsertContent';

interface SpanStyle {
  style: string;
  value: string;
}

describe('browser.tinymce.core.content.insert.MergeInsertedSpansTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, [], true);

  const red = '#ff0000';
  const green = '#00ff00';
  const blue = '#0000ff';

  // const buildNestedSpans = (style: string, values: string[], text: string): string => Arr.foldr(values, (acc, v) => `<span style="${style}: ${v};">${acc}</span>`, text);
  const buildNestedSpans = (spans: SpanStyle[][], text: string): string => Arr.foldr(spans, (acc, spanStyles) => `<span style="${Arr.foldr(spanStyles, (acc, span) => ` ${span.style}: ${span.value};${acc}`, '').trim()}">${acc}</span>`, text);

  const testMergeNestedSpans = (initial: string, inserted: string, expected: string, path: number[], offset: number) => {
    const editor = hook.editor();
    editor.setContent('<p>' + initial + '</p>');
    TinySelections.setCursor(editor, path, offset);
    InsertContent.insertAtCaret(editor, {
      content: inserted,
      merge: true
    });
    TinyAssertions.assertContent(editor, '<p>' + expected + '</p>');
  };

  Arr.each([ 'color', 'background-color' ], (style) => {
    it('TINY-10869: Merging one styled span inserted into span with same style', () => {
      const initial = buildNestedSpans([[{ style, value: red }]], 'test');
      const inserted = buildNestedSpans([[{ style, value: red }]], 'test');
      const expected = buildNestedSpans([[{ style, value: red }]], 'tetestst');
      testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0 ], 2);
    });

    it('TINY-10869: Merging one different styled span inserted into initial span', () => {
      const initial = buildNestedSpans([[{ style, value: red }]], 'test');
      const inserted = buildNestedSpans([[{ style, value: blue }]], 'test');
      const expected = buildNestedSpans([[{ style, value: red }]], 'te' + inserted + 'st');
      testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0 ], 2);
    });

    it('TINY-10869: Merging one different and one identical styled spans inserted into initial spans', () => {
      const initial = buildNestedSpans([[{ style, value: red }], [{ style, value: green }]], 'test');
      const inserted = buildNestedSpans([[{ style, value: blue }], [{ style, value: red }]], 'test');
      const expected = buildNestedSpans([[{ style, value: red }], [{ style, value: green }]], 'te' + buildNestedSpans([[{ style, value: blue }]], 'test') + 'st');
      testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
    });

    it('TINY-10869: Merging two different styled spans inserted into initial spans', () => {
      const initial = buildNestedSpans([[{ style, value: red }], [{ style, value: green }]], 'test');
      const inserted = buildNestedSpans([[{ style, value: '#000000' }], [{ style, value: blue }]], 'test');
      const expected = buildNestedSpans([[{ style, value: red }], [{ style, value: green }]], 'te' + inserted + 'st');
      testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
    });

    it('TINY-10869: Merging three identical styled spans inserted into initial spans', () => {
      const initial = buildNestedSpans([[{ style, value: red }], [{ style, value: green }], [{ style, value: blue }]], 'test');
      const inserted = buildNestedSpans([[{ style, value: red }], [{ style, value: green }], [{ style, value: blue }]], 'test');
      const expected = buildNestedSpans([[{ style, value: red }], [{ style, value: green }], [{ style, value: blue }]], 'tetestst');
      testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0, 0 ], 2);
    });
  });

  it('TINY-10869: Merging one styled spans inserted into different styled initial span', () => {
    const initial = buildNestedSpans([[{ style: 'color', value: red }]], 'test');
    const inserted = buildNestedSpans([[{ style: 'background-color', value: blue }]], 'test');
    const expected = buildNestedSpans([[{ style: 'color', value: red }]], 'te' + inserted + 'st');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging two spans of same style into two different styled initial spans', () => {
    const initial = buildNestedSpans([[{ style: 'color', value: red }], [{ style: 'color', value: green }]], 'test');
    const inserted = buildNestedSpans([[{ style: 'background-color', value: blue }], [{ style: 'background-color', value: red }]], 'test');
    const expected = buildNestedSpans([[{ style: 'color', value: red }], [{ style: 'color', value: green }]], 'te' + inserted + 'st');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging two different styled spans inserted into two identical styled initial spans', () => {
    const initial = buildNestedSpans([[{ style: 'color', value: red }], [{ style: 'background-color', value: green }]], 'test');
    const inserted = buildNestedSpans([[{ style: 'color', value: red }], [{ style: 'background-color', value: green }]], 'test');
    const expected = buildNestedSpans([[{ style: 'color', value: red }], [{ style: 'background-color', value: green }]], 'tetestst');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging two different styled spans inserted into two different styled initial spans', () => {
    const initial = buildNestedSpans([[{ style: 'color', value: red }], [{ style: 'background-color', value: green }]], 'test');
    const inserted = buildNestedSpans([[{ style: 'background-color', value: blue }], [{ style: 'color', value: green }]], 'test');
    const expected = buildNestedSpans([[{ style: 'color', value: red }], [{ style: 'background-color', value: green }]], 'te' + inserted + 'st');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging four different styled spans inserted into four different styled initial spans, with some spans identical', () => {
    const initial = buildNestedSpans([
      [{ style: 'color', value: red }],
      [{ style: 'color', value: green }],
      [{ style: 'background-color', value: green }],
      [{ style: 'background-color', value: blue }]
    ], 'test');
    const inserted = buildNestedSpans([
      [{ style: 'background-color', value: blue }],
      [{ style: 'background-color', value: red }],
      [{ style: 'color', value: red }],
      [{ style: 'color', value: blue }],
    ], 'test');
    const expectedInserted = buildNestedSpans([
      [{ style: 'background-color', value: red }],
      [{ style: 'color', value: blue }],
    ], 'test');
    const expected = buildNestedSpans([
      [{ style: 'color', value: red }],
      [{ style: 'color', value: green }],
      [{ style: 'background-color', value: green }],
      [{ style: 'background-color', value: blue }],
    ], 'te' + expectedInserted + 'st');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging span with two styles inserted into initial span with different styles', () => {
    const initial = buildNestedSpans([[{ style: 'color', value: blue }, { style: 'background-color', value: red }]], 'test');
    const inserted = buildNestedSpans([[{ style: 'color', value: red }, { style: 'background-color', value: blue }]], 'test');
    const expected = buildNestedSpans([[{ style: 'color', value: blue }, { style: 'background-color', value: red }]], 'te' + inserted + 'st');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging span with two styles inserted into initial span with identical styles', () => {
    const initial = buildNestedSpans([[{ style: 'color', value: blue }, { style: 'background-color', value: red }]], 'test');
    const inserted = initial;
    const expected = buildNestedSpans([[{ style: 'color', value: blue }, { style: 'background-color', value: red }]], 'tetestst');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging two nested spans with different styles inserted into one initial span with same style as one span', () => {
    const initial = buildNestedSpans([[{ style: 'color', value: blue }, { style: 'background-color', value: red }]], 'test');
    const inserted = buildNestedSpans([
      [{ style: 'color', value: red }, { style: 'background-color', value: blue }],
      [{ style: 'color', value: blue }, { style: 'background-color', value: red }]
    ], 'test');
    const expectedInserted = buildNestedSpans([[{ style: 'color', value: red }, { style: 'background-color', value: blue }]], 'test');
    const expected = buildNestedSpans([[{ style: 'color', value: blue }, { style: 'background-color', value: red }]], 'te' + expectedInserted + 'st');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging two nested spans with different styles inserted into one initial span with same style as one span but different order', () => {
    const initial = buildNestedSpans([[{ style: 'color', value: blue }, { style: 'background-color', value: red }]], 'test');
    const inserted = buildNestedSpans([
      [{ style: 'color', value: red }, { style: 'background-color', value: blue }],
      [{ style: 'background-color', value: red }, { style: 'color', value: blue }]
    ], 'test');
    const expectedInserted = buildNestedSpans([[{ style: 'color', value: red }, { style: 'background-color', value: blue }]], 'test');
    const expected = buildNestedSpans([[{ style: 'color', value: blue }, { style: 'background-color', value: red }]], 'te' + expectedInserted + 'st');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging two nested spans with different styles inserted into one initial span with both styles', () => {
    const initial = buildNestedSpans([[{ style: 'color', value: blue }, { style: 'background-color', value: red }]], 'test');
    const inserted = buildNestedSpans([[{ style: 'color', value: blue }], [{ style: 'background-color', value: red }]], 'test');
    const expected = buildNestedSpans([[{ style: 'color', value: blue }, { style: 'background-color', value: red }]], 'te' + inserted + 'st');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging one span with two styles into nested spans each with one same style', () => {
    const initial = buildNestedSpans([[{ style: 'color', value: blue }], [{ style: 'background-color', value: red }]], 'test');
    const inserted = buildNestedSpans([[{ style: 'color', value: blue }, { style: 'background-color', value: red }]], 'test');
    const expected = buildNestedSpans([[{ style: 'color', value: blue }], [{ style: 'background-color', value: red }]], 'te' + inserted + 'st');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging two spans with different styles into two nested spans with matching styles', () => {
    const initial = buildNestedSpans([
      [{ style: 'color', value: red }, { style: 'background-color', value: blue }],
      [{ style: 'background-color', value: red }, { style: 'color', value: blue }]
    ], 'test');
    const inserted = buildNestedSpans([
      [{ style: 'color', value: red }, { style: 'background-color', value: blue }],
      [{ style: 'background-color', value: red }, { style: 'color', value: blue }]
    ], 'test');
    const expected = buildNestedSpans([
      [{ style: 'color', value: red }, { style: 'background-color', value: blue }],
      [{ style: 'background-color', value: red }, { style: 'color', value: blue }]
    ], 'tetestst');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
  });

  it('TINY-10869: Merging two spans with different styles into two nested spans with matching styles but reversed order', () => {
    const initial = buildNestedSpans([
      [{ style: 'color', value: red }, { style: 'background-color', value: blue }],
      [{ style: 'background-color', value: red }, { style: 'color', value: blue }]
    ], 'test');
    const inserted = buildNestedSpans([
      [{ style: 'background-color', value: red }, { style: 'color', value: blue }],
      [{ style: 'color', value: red }, { style: 'background-color', value: blue }]
    ], 'test');
    const expected = buildNestedSpans([
      [{ style: 'color', value: red }, { style: 'background-color', value: blue }],
      [{ style: 'background-color', value: red }, { style: 'color', value: blue }]
    ], 'tetestst');
    testMergeNestedSpans(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
  });
});
