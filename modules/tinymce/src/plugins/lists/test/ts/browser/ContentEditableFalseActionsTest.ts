import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.ContentEditableFalseActionsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  it('TINY-8920: List toolbar buttons are disabled when in noneditable OL list', () => {
    const editor = hook.editor();
    const content = '<ol contenteditable="false">\n' +
      '<li contenteditable="true">editable</li>\n' +
      '<li>noneditable</li>\n' +
      '<li contenteditable="true">editable</li>\n' +
    '</ol>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 1, 2, 0 ], 0);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Numbered list"]');
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
  });

  it('TINY-8920: List toolbar buttons are disabled when in noneditable UL list', () => {
    const editor = hook.editor();
    const content = '<ul contenteditable="false">\n' +
      '<li contenteditable="true">editable</li>\n' +
      '<li>noneditable</li>\n' +
      '<li contenteditable="true">editable</li>\n' +
    '</ul>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 1, 2, 0 ], 0);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Numbered list"]');
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Bullet list"]');
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
  });

  it('TINY-8920: List commands are disabled in noneditable OL list', () => {
    const editor = hook.editor();
    const content = '<ul contenteditable="false">\n' +
      '<li contenteditable="true">editable</li>\n' +
      '<li>noneditable</li>\n' +
      '<li contenteditable="true">editable</li>\n' +
    '</ul>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 1, 2, 0 ], 0);
    editor.execCommand('RemoveList');
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
    editor.execCommand('InsertUnorderedList');
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
    editor.execCommand('InsertOrderedList');
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
    editor.execCommand('InsertDefinitionList');
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
    editor.execCommand('mceListProps');
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
    editor.execCommand('mceListUpdate', false, {attrs: {contenteditable: "true"}});
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
  });

  it('TINY-8920: List commands are disabled in noneditable UL list', () => {
    const editor = hook.editor();
    const content = '<ul contenteditable="false">\n' +
      '<li contenteditable="true">editable</li>\n' +
      '<li>noneditable</li>\n' +
      '<li contenteditable="true">editable</li>\n' +
    '</ul>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 1, 2, 0 ], 0);
    editor.execCommand('RemoveList');
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
    editor.execCommand('InsertUnorderedList');
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
    editor.execCommand('InsertOrderedList');
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
    editor.execCommand('InsertDefinitionList');
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
    editor.execCommand('mceListUpdate', false, {attrs: {contenteditable: "true"}});
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
  });
});
