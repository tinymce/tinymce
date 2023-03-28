import { Keys, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/charmap/Plugin';

describe('browser.tinymce.plugins.charmap.NoneditableRootTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'charmap',
    toolbar: 'charmap',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const withNoneditableRootEditor = (editor: Editor, f: (editor: Editor) => void) => {
    editor.getBody().contentEditable = 'false';
    f(editor);
    editor.getBody().contentEditable = 'true';
  };

  it('TINY-9669: Disable charmap button on noneditable content', () => {
    withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Special character"][aria-disabled="true"]');
      TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Special character"][aria-disabled="false"]');
    });
  });

  it('TINY-9669: Disable charmap menuitem on noneditable content', async () => {
    const editor = hook.editor();
    editor.getBody().contentEditable = 'false';
    editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
    TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
    await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][title="Special character..."][aria-disabled="true"]');
    TinyUiActions.keystroke(editor, Keys.escape());
    TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
    TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
    await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][title="Special character..."][aria-disabled="false"]');
    TinyUiActions.keystroke(editor, Keys.escape());
    editor.getBody().contentEditable = 'true';
  });
});

