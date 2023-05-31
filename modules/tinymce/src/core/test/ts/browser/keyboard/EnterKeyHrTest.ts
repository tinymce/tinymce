import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.keyboard.EnterKeyHrTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  it('Enter before HR in the beginning of content', () => {
    const editor = hook.editor();
    editor.setContent('<hr /><p>a</p>');
    TinySelections.setCursor(editor, [], 0);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContent(editor, '<p>&nbsp;</p><hr><p>a</p>');
    TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
  });

  it('Enter after HR in the beginning of content', () => {
    const editor = hook.editor();
    editor.setContent('<hr /><p>a</p>');
    TinySelections.setCursor(editor, [], 1);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContent(editor, '<hr><p>&nbsp;</p><p>a</p>');
    TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
  });

  it('Enter before HR in the middle of content', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><hr /><p>b</p>');
    TinySelections.setCursor(editor, [], 1);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContent(editor, '<p>a</p><p>&nbsp;</p><hr><p>b</p>');
    TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
  });

  it('Enter after HR in the middle of content', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><hr /><p>b</p>');
    TinySelections.setCursor(editor, [], 2);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContent(editor, '<p>a</p><hr><p>&nbsp;</p><p>b</p>');
    TinyAssertions.assertSelection(editor, [ 2 ], 0, [ 2 ], 0);
  });

  it('Enter before HR in the end of content', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><hr />');
    TinySelections.setCursor(editor, [], 1);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContent(editor, '<p>a</p><p>&nbsp;</p><hr>');
    TinyAssertions.assertSelection(editor, [ 1 ], 0, [ 1 ], 0);
  });

  it('Enter after HR in the end of content', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p><hr />');
    TinySelections.setCursor(editor, [], 2);
    TinyContentActions.keystroke(editor, Keys.enter());
    TinyAssertions.assertContent(editor, '<p>a</p><hr><p>&nbsp;</p>');
    TinyAssertions.assertSelection(editor, [ 2 ], 0, [ 2 ], 0);
  });
});
