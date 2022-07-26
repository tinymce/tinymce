import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.FormatterClosestTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const assertClosest = (names: string[], expectedName: string | null) => {
    const actualName = hook.editor().formatter.closest(names);
    assert.equal(actualName, expectedName, 'Should match expected format name');
  };

  it('TBA: Should return null since the caret is not inside a bold format', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    assertClosest([ 'bold' ], null);
  });

  it('TBA: Should return p block format since caret is inside a p', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    assertClosest([ 'p', 'h1' ], 'p');
  });

  it('TBA: Should return h1 block format since caret is inside a h1', () => {
    const editor = hook.editor();
    editor.setContent('<h1>a</h1>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    assertClosest([ 'p', 'h1' ], 'h1');
  });

  it('TBA: Should return italic inline format since caret is inside a em element', () => {
    const editor = hook.editor();
    editor.setContent('<p><em>a<em></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    assertClosest([ 'p', 'italic' ], 'italic');
  });

  it('TBA: Should return aligncenter selector format since caret is in a paragraph that is center aligned', () => {
    const editor = hook.editor();
    editor.setContent('<p style="text-align: center">a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    assertClosest([ 'aligncenter', 'p' ], 'aligncenter');
  });

  it('TBA: Should return p block format since caret is inside a em inside a p element', () => {
    const editor = hook.editor();
    editor.setContent('<p><em>a<em></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    assertClosest([ 'p' ], 'p');
  });

  it('TBA: Should return aligncenter since that format is before the also matching p format', () => {
    const editor = hook.editor();
    editor.setContent('<p style="text-align: center">a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    assertClosest([ 'aligncenter', 'p' ], 'aligncenter');
  });

  it('TBA: Should return p since that format is before the also matching aligncenter format', () => {
    const editor = hook.editor();
    editor.setContent('<p style="text-align: center">a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    assertClosest([ 'p', 'aligncenter' ], 'p');
  });

  it('TBA: Should return aligncenter selector format since caret is inside a em inside a p element that is center aligned', () => {
    const editor = hook.editor();
    editor.setContent('<p style="text-align: center"><em>a<em></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    assertClosest([ 'aligncenter', 'p' ], 'aligncenter');
  });
});
