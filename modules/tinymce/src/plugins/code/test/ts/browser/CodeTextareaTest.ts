import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/code/Plugin';

describe('browser.tinymce.plugins.code.CodeTextareaTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'code',
    toolbar: 'code',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const pOpenDialog = async (editor: Editor) => {
    editor.execCommand('mceCodeEditor');
    await TinyUiActions.pWaitForDialog(editor);
  };

  const getWhiteSpace = (editor: Editor) => {
    const element = editor.getElement();
    return editor.dom.getStyle(element, 'white-space', true);
  };

  const pAssertWhiteSpace = async (editor: Editor) => {
    await pOpenDialog(editor);
    const whitespace = getWhiteSpace(editor);
    assert.equal(whitespace, 'pre-wrap', 'Textarea should have "white-space: pre-wrap"');
  };

  it('TBA: Verify if "white-space: pre-wrap" style is set on the textarea', async () => {
    const editor = hook.editor();
    await pAssertWhiteSpace(editor);
    TinyUiActions.cancelDialog(editor);
  });
});
