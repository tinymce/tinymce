import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.lists.ItemListStyleTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  });

  const getItemStyleType = (editor: Editor, index: number) =>
    editor.dom.getStyle(editor.dom.select('li')[index], 'list-style-type');

  it('TINYMCE-14565: Applying a list style unset the list item style', () => {
    const editor = hook.editor();
    editor.setContent('<ol><li>a</li><li style="list-style-type: upper-alpha;">b</li></ol>');
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
    editor.execCommand('InsertOrderedList', false, { 'list-style-type': 'lower-roman' });

    TinyAssertions.assertContent(editor, '<ol style="list-style-type: lower-roman;"><li>a</li><li>b</li></ol>');
  });

  it('TINYMCE-14565: Applying a list style keeps the list-style-type: none', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li style="list-style-type: upper-alpha;">a</li>' +
      '<li style="list-style-type: none;"><ol><li>b</li></ol></li>' +
      '</ol>'
    );
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0, 0 ], 1);
    editor.execCommand('InsertOrderedList', false, { 'list-style-type': 'lower-roman' });

    assert.equal(getItemStyleType(editor, 1), 'none', 'the nested list wrapper keeps its list-style-type');
  });

  it('TINYMCE-14565: Applying a list style does not unset styles of nested list items', () => {
    const editor = hook.editor();
    editor.setContent(
      '<ol>' +
      '<li style="list-style-type: upper-alpha;">a' +
      '<ol><li style="list-style-type: upper-alpha;">b</li></ol>' +
      '</li>' +
      '</ol>'
    );
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    editor.execCommand('InsertOrderedList', false, { 'list-style-type': 'lower-roman' });

    assert.equal(getItemStyleType(editor, 0), '', 'the selected item is cleared');
    assert.equal(getItemStyleType(editor, 1), 'upper-alpha', 'the unselected nested item is untouched');
  });
});
