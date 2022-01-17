import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';

describe('browser.tinymce.plugins.table.IndentListsInTableTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists table',
    toolbar: 'table numlist',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ ListsPlugin, TablePlugin ], true);

  const assertTableInnerHTML = (editor: Editor, expected: string) => {
    const table = editor.getBody().firstChild as HTMLTableElement;
    assert.equal(table.innerHTML, expected, 'Does not have correct html');
  };

  it('TBA: ul > li in table', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td><ul><li>a</li><li>b</li></ul></td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0, 1 ], 1);
    TinyContentActions.keystroke(editor, Keys.tab());
    assertTableInnerHTML(editor, '<tbody><tr><td><ul><li>a<ul><li>b</li></ul></li></ul></td></tr></tbody>');
  });

  it('TBA: ol > li in table', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td><ol><li>a</li><li>b</li></ol></td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0, 1 ], 1);
    TinyContentActions.keystroke(editor, Keys.tab());
    assertTableInnerHTML(editor, '<tbody><tr><td><ol><li>a<ol><li>b</li></ol></li></ol></td></tr></tbody>');
  });

  it('TBA: dl > dt in table', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td><dl><dt>a</dt><dt>b</dt></dl></td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0, 1 ], 1);
    TinyContentActions.keystroke(editor, Keys.tab());
    assertTableInnerHTML(editor, '<tbody><tr><td><dl><dt>a</dt><dd>b</dd></dl></td></tr></tbody>');
  });
});
