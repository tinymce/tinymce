import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/code/Plugin';

describe('browser.tinymce.plugins.code.CodeSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'code',
    toolbar: 'code',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const toolbarButtonSelector = '[role="toolbar"] button[aria-label="Source code"]';

  const setTextareaContent = (content: string) => {
    const textarea = document.querySelector('div[role="dialog"] textarea') as HTMLTextAreaElement;
    textarea.value = content;
  };

  const assertTextareaContent = (expected: string) => {
    const textarea = document.querySelector('div[role="dialog"] textarea') as HTMLTextAreaElement;
    assert.equal(textarea.value, expected, 'Should have correct value');
  };

  it('TBA: Set content in empty editor and assert values', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
    await TinyUiActions.pWaitForDialog(editor);
    assertTextareaContent('');
    setTextareaContent('<em>a</em>');
    TinyUiActions.submitDialog(editor);
    TinyAssertions.assertContent(editor, '<p><em>a</em></p>');

    // Reopen dialog and check textarea content is correct
    TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
    await TinyUiActions.pWaitForDialog(editor);
    assertTextareaContent('<p><em>a</em></p>');
    TinyUiActions.cancelDialog(editor);
  });

  it('TBA: Change source code and assert editor content changes', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
    await TinyUiActions.pWaitForDialog(editor);
    setTextareaContent('<strong>b</strong>');
    TinyUiActions.submitDialog(editor);
    TinyAssertions.assertContent(editor, '<p><strong>b</strong></p>');
  });
});
