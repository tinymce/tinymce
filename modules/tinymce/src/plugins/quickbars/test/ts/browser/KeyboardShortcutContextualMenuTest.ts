import { FocusTools, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyContentActions, McEditor, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import QuickbarsPlugin from 'tinymce/plugins/quickbars/Plugin';

describe('browser.tinymce.core.focus.MediaFocusTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'quickbars',
    quickbars_insert_toolbar: 'quicktable image media codesample',
    quickbars_selection_toolbar: 'bold italic underline | formatselect | bullist numlist | blockquote quicklink',
    contextmenu: 'undo redo | inserttable | cell row column deletetable | help',
    base_url: '/project/tinymce/js/tinymce',
  }, [ QuickbarsPlugin ]);

  const doc = SugarDocument.getDocument();

  it('TINY-4211: Focus media will select the object', async () => {
    const editor = hook.editor();
    editor.setContent('<p>aaaaaaa</p>');
    editor.focus();
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    setTimeout(() => {
      TinyContentActions.keystroke(editor, 120, { ctrl: true });
    }, 500);
    await FocusTools.pTryOnSelector('Assert toolbar is focused', doc, 'div[role=toolbar] .tox-tbtn');
    TinyUiActions.keystroke(editor, Keys.escape());
    await FocusTools.pTryOnSelector('Assert editor is focused', doc, 'iframe');
    McEditor.remove(editor);
  });
});
