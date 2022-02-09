import { UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.core.UndoRedoUiTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'redo undo',
    menubar: true
  }, []);

  const assertToolbarButtonDisabled = (title: string, state: boolean = true) =>
    UiFinder.exists(SugarBody.body(), `button[title="${title}"][aria-disabled="${state}"]`);

  const pAssertMenuItemDisabled = (item: string, state: boolean = true) =>
    Waiter.pTryUntil('Wait for a specific menu to open', () => UiFinder.exists(SugarBody.body(), `[role="menuitem"][aria-disabled=${state}"]:contains("${item}")`));

  it('TINY-8101: Undo/redo should function as expected in normal editor mode', () => {
    const editor = hook.editor();
    assertToolbarButtonDisabled('Redo');
    assertToolbarButtonDisabled('Undo');

    TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
    pAssertMenuItemDisabled('Redo');
    pAssertMenuItemDisabled('Undo');

    // 1. Insert content, expect undo to be enabled
    editor.insertContent('<p>slsl</p>');
    assertToolbarButtonDisabled('Redo');
    assertToolbarButtonDisabled('Undo', false);

    TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
    pAssertMenuItemDisabled('Redo');
    pAssertMenuItemDisabled('Undo', false);

    // 2. Expect redo to be enabled after clicking undo
    TinyUiActions.clickOnToolbar(editor, '.tox-tbtn[title="Undo"]');
    pAssertMenuItemDisabled('Redo', false);
    pAssertMenuItemDisabled('Undo');
  });

  it('TINY-8101: Undo/redo are always disabled in readonly mode', () => {
    const editor = hook.editor();
    editor.mode.set('readonly');
    assertToolbarButtonDisabled('Redo');
    assertToolbarButtonDisabled('Undo');
    pAssertMenuItemDisabled('Redo');
    pAssertMenuItemDisabled('Undo');
    // insert some content
    editor.insertContent('<p>slsl</p>');
    assertToolbarButtonDisabled('Redo');
    assertToolbarButtonDisabled('Undo');
    pAssertMenuItemDisabled('Redo');
    pAssertMenuItemDisabled('Undo');
  });
});
