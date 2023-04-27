import { Keys, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyState, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.core.PasteControlsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    menubar: 'edit',
    toolbar: 'pastetext',
  }, []);

  context('Noneditable root', () => {
    it('TINY-9669: Disable pastetext button noneditable content', () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
        UiFinder.exists(SugarBody.body(), '[aria-label="Paste as text"][aria-disabled="true"]');
        TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
        UiFinder.exists(SugarBody.body(), '[aria-label="Paste as text"][aria-disabled="false"]');
      });
    });

    it('TINY-9669: Disable pastetext menuitem noneditable content', async () => {
      await TinyState.withNoneditableRootEditorAsync(hook.editor(), async (editor) => {
        editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
        TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
        await TinyUiActions.pWaitForUi(editor, '[role="menu"] [title="Paste as text"][aria-disabled="true"]');
        TinyUiActions.keystroke(editor, Keys.escape());
        TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
        TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
        await TinyUiActions.pWaitForUi(editor, '[role="menu"] [title="Paste as text"][aria-disabled="false"]');
        TinyUiActions.keystroke(editor, Keys.escape());
      });
    });
  });
});

