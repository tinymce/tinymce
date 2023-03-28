import { Keys, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

describe('browser.tinymce.plugins.table.NoneditableRootTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'table',
    toolbar: 'table',
    menu: {
      insert: { title: 'Insert', items: 'inserttable inserttabledialog' }
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const withNoneditableRootEditor = (editor: Editor, f: (editor: Editor) => void) => {
    editor.getBody().contentEditable = 'false';
    f(editor);
    editor.getBody().contentEditable = 'true';
  };

  it('TINY-9669: Disable table button on noneditable content', () => {
    withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Table"]:disabled');
      TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Table"]:not(:disabled)');
    });
  });

  it('TINY-9669: Disable inserttable menuitem on noneditable content', async () => {
    const editor = hook.editor();
    editor.getBody().contentEditable = 'false';
    editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
    TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
    await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][title="Table"][aria-disabled="true"]');
    TinyUiActions.keystroke(editor, Keys.escape());
    TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
    TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
    await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][title="Table"][aria-disabled="false"]');
    TinyUiActions.keystroke(editor, Keys.escape());
    editor.getBody().contentEditable = 'true';
  });

  it('TINY-9669: Disable inserttabledialog menuitem on noneditable content', async () => {
    const editor = hook.editor();
    editor.getBody().contentEditable = 'false';
    editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
    TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
    await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][title="Insert table"][aria-disabled="true"]');
    TinyUiActions.keystroke(editor, Keys.escape());
    TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
    TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
    await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][title="Insert table"][aria-disabled="false"]');
    TinyUiActions.keystroke(editor, Keys.escape());
    editor.getBody().contentEditable = 'true';
  });
});

