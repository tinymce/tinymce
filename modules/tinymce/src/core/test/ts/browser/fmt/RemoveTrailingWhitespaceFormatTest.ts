import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.fmt.RemoveTrailingWhitespaceFormatTest', () => {
  const boldSelector = 'button[aria-label="Bold"]';
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'bold'
  }, [], true);

  it('remove bold with leading whitespace', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong>a b</strong></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 3);
    TinyUiActions.clickOnToolbar(editor, boldSelector);
    TinyAssertions.assertContent(editor, '<p><strong>a</strong> b</p>');
  });

  it('remove bold with trailing whitespace', () => {
    const editor = hook.editor();
    editor.setContent('<p><strong>a b</strong></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 2);
    TinyUiActions.clickOnToolbar(editor, boldSelector);
    TinyAssertions.assertContent(editor, '<p>a <strong>b</strong></p>');
  });

  it('unlink with leading whitespace', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="#">a b</a></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 1, [ 0, 0, 0 ], 3);
    editor.execCommand('unlink');
    TinyAssertions.assertContent(editor, '<p><a href="#">a</a> b</p>');
  });

  it('unlink with trailing whitespace', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="#">a b</a></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 2);
    editor.execCommand('unlink');
    TinyAssertions.assertContent(editor, '<p>a <a href="#">b</a></p>');
  });
});
