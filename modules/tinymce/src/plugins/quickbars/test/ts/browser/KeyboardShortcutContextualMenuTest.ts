import { FocusTools, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyContentActions, McEditor, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/quickbars/Plugin';

describe('browser.tinymce.plugins.quickbars.KeyboardShortcutContextualMenuTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'quickbars',
    quickbars_insert_toolbar: 'quicktable image media codesample',
    quickbars_selection_toolbar: 'bold italic underline | formatselect | bullist numlist | blockquote quicklink',
    contextmenu: 'undo redo | inserttable | cell row column deletetable | help',
    base_url: '/project/tinymce/js/tinymce',
  }, [ Plugin ], true);

  const doc = SugarDocument.getDocument();

  it('TINY-2884: keypress should focus on contextual menu', async () => {
    const editor = hook.editor();
    editor.setContent('<p>aaaaaaa</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    TinyContentActions.keystroke(editor, 120, { ctrl: true });
    await FocusTools.pTryOnSelector('Assert toolbar is focused', doc, 'div[role=toolbar] .tox-tbtn');
    TinyUiActions.keystroke(editor, Keys.escape());
    await FocusTools.pTryOnSelector('Assert editor is focused', doc, 'iframe');
    McEditor.remove(editor);
  });
});
