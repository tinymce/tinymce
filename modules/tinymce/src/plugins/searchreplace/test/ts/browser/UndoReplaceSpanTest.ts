import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/searchreplace/Plugin';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.searchreplace.UndoReplaceSpanTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'searchreplace',
    toolbar: 'searchreplace',
    base_url: '/project/tinymce/js/tinymce',
  }, [ Plugin ]);

  it('TBA: replace one of three found, undo and redo and assert there is no matcher spans in editor', async () => {
    const editor = hook.editor();
    editor.setContent('<p>cats cats cats</p>');

    await Utils.pOpenDialog(editor);
    await Utils.pSetFieldValue(editor, 'input.tox-textfield[placeholder="Find"]', 'cats');
    await Utils.pSetFieldValue(editor, 'input.tox-textfield[placeholder="Replace with"]', 'dogs');
    Utils.clickFind(editor);
    await UiFinder.pWaitFor('wait for button to be enabled', SugarBody.body(), 'button[disabled!="disabled"]:contains("Replace")');
    Utils.clickReplace(editor);
    Utils.clickClose(editor);
    editor.undoManager.undo();
    TinyAssertions.assertContent(editor, '<p>cats cats cats</p>');
    editor.undoManager.redo();
    TinyAssertions.assertContentPresence(editor, { 'span.mce-match-marker': 0 });
    TinyAssertions.assertContent(editor, '<p>dogs cats cats</p>');
  });
});
