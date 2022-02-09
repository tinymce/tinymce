import { Keys, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.core.UndoRedoTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'redo undo',
    menubar: true
  }, []);

  const assertToolbarButtonDisabled = (title: string, state: boolean = true) =>
    UiFinder.exists(SugarBody.body(), `button[title="${title}"][aria-disabled="${state}"]`);

  const pAssertMenuItemDisabled = (editor, item: string, state: boolean = true) =>
    TinyUiActions.pWaitForUi(editor, `div[title="${item}"][role="menuitem"][aria-disabled="${state}"]`);

  it('TINY-8101: Undo/redo should be disabled by default', async () => {
    const editor = hook.editor();
    assertToolbarButtonDisabled('Redo');
    assertToolbarButtonDisabled('Undo');
    TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
    await pAssertMenuItemDisabled(editor, 'Redo');
    await pAssertMenuItemDisabled(editor, 'Undo');
    TinyUiActions.keydown(hook.editor(), Keys.escape());
  });

  it('TINY-8101: Undo/redo should be disabled/enabled if dirty', async () => {
    const editor = hook.editor();
    // 1. Insert content, undo should be enabled and redo should be still disabled
    editor.insertContent('<p>slsl</p>');
    assertToolbarButtonDisabled('Redo');
    assertToolbarButtonDisabled('Undo', false);
    TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
    await pAssertMenuItemDisabled(editor, 'Redo');
    await pAssertMenuItemDisabled(editor, 'Undo', false);
    TinyUiActions.keydown(hook.editor(), Keys.escape());

    // 2. Redo should be enabled after undo being clicked
    TinyUiActions.clickOnToolbar(editor, '.tox-tbtn[title="Undo"]');
    assertToolbarButtonDisabled('Redo', false);
    assertToolbarButtonDisabled('Undo');
    TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
    await pAssertMenuItemDisabled(editor, 'Redo', false);
    await pAssertMenuItemDisabled(editor, 'Undo');
    TinyUiActions.keydown(hook.editor(), Keys.escape());
  });

  it('TINY-8101: Undo/redo are always disabled in readonly mode', () => {
    const editor = hook.editor();
    editor.mode.set('readonly');
    assertToolbarButtonDisabled('Redo');
    assertToolbarButtonDisabled('Undo');
  });
});
