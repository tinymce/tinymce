import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.lists.BackspaceDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TINY-8920: backspace from beginning editable first li in noneditable ol with no change', () => {
    const editor = hook.editor();
    const content = '<ol contenteditable="false">\n' +
      '<li contenteditable="true">editable</li>\n' +
      '<li>noneditable</li>\n' +
    '</ol>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
  });

  it('TINY-8920: backspace from beginning second editable li in noneditable ol with no change', () => {
    const editor = hook.editor();
    const content = '<ol contenteditable="false">\n' +
      '<li contenteditable="true">editable</li>\n' +
      '<li>noneditable</li>\n' +
      '<li contenteditable="true">editable</li>\n' +
    '</ol>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 0, 2, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
  });

  it('TINY-8920: enter from beginning editable first li in noneditable ol with no change', () => {
    const editor = hook.editor();
    const content = '<ol contenteditable="false">\n' +
      '<li contenteditable="true">editable</li>\n' +
      '<li>noneditable</li>\n' +
    '</ol>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
  });

  it('TINY-8920: enter from beginning second editable li in noneditable ol with no change', () => {
    const editor = hook.editor();
    const content = '<ol contenteditable="false">\n' +
      '<li contenteditable="true">editable</li>\n' +
      '<li>noneditable</li>\n' +
      '<li contenteditable="true">editable</li>\n' +
    '</ol>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 0, 2, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
  });

  it('TINY-8920: tab from beginning editable first li in noneditable ol with no change', () => {
    const editor = hook.editor();
    const content = '<ol contenteditable="false">\n' +
      '<li contenteditable="true">editable</li>\n' +
      '<li>noneditable</li>\n' +
    '</ol>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.tab());
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
  });

  it('TINY-8920: tab from beginning second editable li in noneditable ol with no change', () => {
    const editor = hook.editor();
    const content = '<ol contenteditable="false">\n' +
      '<li contenteditable="true">editable</li>\n' +
      '<li>noneditable</li>\n' +
      '<li contenteditable="true">editable</li>\n' +
    '</ol>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 0, 2, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.tab());
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
  });
});
