import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.ChangeListStyleTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    plugins: 'lists',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TBA: ul to ol, cursor only in parent', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li><ul><li>b</li></ul></ul>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Numbered list"]');
    TinyAssertions.assertContent(editor, '<ol><li>a</li><ul><li>b</li></ul></ol>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
  });

  it('TBA: ul to ol, selection from parent to sublist', () => {
    const editor = hook.editor();
    editor.setContent('<ul><li>a</li><ol><li>b</li></ol></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Numbered list"]');
    TinyAssertions.assertContent(editor, '<ol><li>a</li><ol><li>b</li></ol></ol>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
  });

  it('TBA: ol to ul, cursor only in parent', () => {
    const editor = hook.editor();
    editor.setContent('<ol><li>a</li><ol><li>b</li></ol></ol>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, '<ul><li>a</li><ol><li>b</li></ol></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
  });

  it('TBA: ol to ul, selection from parent to sublist', () => {
    const editor = hook.editor();
    editor.setContent('<ol><li>a</li><ul><li>b</li></ul></ol>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, '<ul><li>a</li><ul><li>b</li></ul></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
  });

  it('TBA: alpha to ol, cursor only in parent', () => {
    const editor = hook.editor();
    editor.setContent('<ul style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ul>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Numbered list"]');
    TinyAssertions.assertContent(editor, '<ol><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
  });

  it('TBA: alpha to ol, selection from parent to sublist', () => {
    const editor = hook.editor();
    editor.setContent('<ul style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ul>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Numbered list"]');
    TinyAssertions.assertContent(editor, '<ol><li>a</li><ol><li>b</li></ol></ol>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
  });

  it('TBA: alpha to ul, cursor only in parent', () => {
    const editor = hook.editor();
    editor.setContent('<ol style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, '<ul><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
  });

  it('TBA: alpha to ul, selection from parent to sublist', () => {
    const editor = hook.editor();
    editor.setContent('<ol style="list-style-type: lower-alpha;"><li>a</li><ol style="list-style-type: lower-alpha;"><li>b</li></ol></ol>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertContent(editor, '<ul><li>a</li><ul><li>b</li></ul></ul>');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 1, 0, 0 ], 1);
  });
});
