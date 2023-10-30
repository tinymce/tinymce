import { Keys, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyState, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.color.NoneditableRootTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    menubar: 'format',
    toolbar: 'forecolor backcolor',
  }, []);

  context('Noneditable root buttons', () => {
    const testDisableButtonOnNoneditable = (title: string) => () => {
      TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
        editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
        UiFinder.exists(SugarBody.body(), `[aria-label^="${title}"][aria-disabled="true"]`);
        TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
        UiFinder.exists(SugarBody.body(), `[aria-label^="${title}"][aria-disabled="false"]`);
      });
    };

    it('TINY-9669: Disable forecolor on noneditable content', testDisableButtonOnNoneditable('Text color'));
    it('TINY-9669: Disable backcolor on noneditable content', testDisableButtonOnNoneditable('Background color'));
  });

  context('Noneditable root menuitems', () => {
    const testDisableMenuitemOnNoneditable = (menu: string, menuitem: string) => async () => {
      await TinyState.withNoneditableRootEditorAsync(hook.editor(), async (editor) => {
        editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
        TinyUiActions.clickOnMenu(editor, `button:contains("${menu}")`);
        await TinyUiActions.pWaitForUi(editor, `[role="menu"] [title^="${menuitem}"][aria-disabled="true"]`);
        TinyUiActions.keystroke(editor, Keys.escape());
        TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
        TinyUiActions.clickOnMenu(editor, `button:contains("${menu}")`);
        await TinyUiActions.pWaitForUi(editor, `[role="menu"] [title^="${menuitem}"][aria-disabled="false"]`);
        TinyUiActions.keystroke(editor, Keys.escape());
      });
    };

    it('TINY-9669: Disable forecolor on noneditable content', testDisableMenuitemOnNoneditable('Format', 'Text color'));
    it('TINY-9669: Disable backcolor on noneditable content', testDisableMenuitemOnNoneditable('Format', 'Background color'));
  });
});
