import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.TableInListTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    toolbar: 'bullist numlist indent outdent',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TBA: unlist table in list then add list inside table', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table></li></ul>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0, 0, 0 ], 0);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, '<ul><li><table><tbody><tr><td><ul><li>a</li></ul></td><td>b</td></tr></tbody></table></li></ul>');
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, '<ul><li><table><tbody><tr><td><p>a</p></td><td>b</td></tr></tbody></table></li></ul>');
  });

  it('TBA: delete list in table test', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li><table><tbody><tr><td><ul><li><p>a</p></li></ul></td><td><p>b</p></td></tr></tbody></table></li></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], 1);
    editor.plugins.lists.backspaceDelete();
    editor.plugins.lists.backspaceDelete();
    TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0, 0 ], 0);
    TinyAssertions.assertContent(editor, '<ul><li><table><tbody><tr><td><p>&nbsp;</p></td><td><p>b</p></td></tr></tbody></table></li></ul>');
  });

  it('TBA: focus on table cell in list does not activate button', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li><table><tbody><tr><td>a</td><td>b</td></tr></tbody></table></li></ul>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0, 0, 0 ], 0);
    UiFinder.notExists(TinyDom.container(editor), 'div[aria-label="Bullet list"][aria-pressed="true"]');
  });

  it('TBA: indent and outdent li in ul in list in table in list', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li><table><tbody><tr><td><ul><li><p>a</p></li><li><p>b</p></li></ul></td><td><p>b</p></td></tr></tbody></table></li></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0, 0, 1, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0, 0, 1, 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Increase indent"]');
    TinyAssertions.assertContent(editor, '<ul><li><table><tbody><tr><td><ul><li><p>a</p><ul><li><p>b</p></li></ul></li></ul></td><td><p>b</p></td></tr></tbody></table></li></ul>');
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Decrease indent"]');
    TinyAssertions.assertContent(editor, '<ul><li><table><tbody><tr><td><ul><li><p>a</p></li><li><p>b</p></li></ul></td><td><p>b</p></td></tr></tbody></table></li></ul>');
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Decrease indent"]');
    TinyAssertions.assertContent(editor, '<ul><li><table><tbody><tr><td><ul><li><p>a</p></li></ul><p>b</p></td><td><p>b</p></td></tr></tbody></table></li></ul>');
  });

  it('TBA: toggle from UL to OL in list in table in list only changes inner list', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li><table><tbody><tr><td><ul><li><p>a</p></li><li><p>b</p></li></ul></td><td><p>b</p></td></tr></tbody></table></li></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0, 0, 0, 1, 0, 0 ], 0, [ 0, 0, 0, 0, 0, 0, 0, 1, 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Numbered list"]');
    TinyAssertions.assertContent(editor, '<ul><li><table><tbody><tr><td><ol><li><p>a</p></li><li><p>b</p></li></ol></td><td><p>b</p></td></tr></tbody></table></li></ul>');
  });
});
