import { Keys, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyState, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/codesample/Plugin';

describe('browser.tinymce.plugins.codesample.NoneditableRootTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'codesample',
    toolbar: 'codesample',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  it('TINY-9669: Disable codesample button on noneditable content', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Insert/edit code sample"][aria-disabled="true"]');
      TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Insert/edit code sample"][aria-disabled="false"]');
    });
  });

  it('TINY-9669: Disable codesample menuitem on noneditable content', async () => {
    await TinyState.withNoneditableRootEditorAsync(hook.editor(), async (editor) => {
      editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
      TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
      await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][title="Code sample..."][aria-disabled="true"]');
      TinyUiActions.keystroke(editor, Keys.escape());
      TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
      TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
      await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][title="Code sample..."][aria-disabled="false"]');
      TinyUiActions.keystroke(editor, Keys.escape());
    });
  });
});

