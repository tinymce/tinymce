import { ApproxStructure, Assertions, Keys, UiFinder, Waiter } from '@ephox/agar';
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

  const pAssertUiDisabled = async (editor: Editor, disabled: boolean) => {
    const overlord = UiFinder.findIn(SugarBody.body(), '.tox-toolbar-overlord').getOrDie();
    await Waiter.pTryUntil(
      'Waiting for toolbar state',
      () => Assertions.assertStructure('Toolbar should be in disabled state', ApproxStructure.build((s, str, arr) =>
        s.element('div', {
          classes: [
            arr.has('tox-toolbar-overlord'),
            disabled ? arr.has('tox-tbtn--disabled') : arr.not('tox-tbtn--disabled')
          ],
          attrs: { 'aria-disabled': str.is(disabled ? 'true' : 'false') }
        })
      ), overlord)
    );
  };

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

  it('TINY-8101: Undo/redo are always disabled in readonly mode', async () => {
    const editor = hook.editor();
    // 1. switch to readonly mode
    editor.mode.set('readonly');
    await pAssertUiDisabled(editor, true);
    assertToolbarButtonDisabled('Redo');
    assertToolbarButtonDisabled('Undo');

    // 2. switch back to design mode. Expect undo to be re-enabled
    editor.mode.set('design');
    await pAssertUiDisabled(editor, false);
    assertToolbarButtonDisabled('Redo', false);
    assertToolbarButtonDisabled('Undo');
    TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
    await pAssertMenuItemDisabled(editor, 'Redo', false);
    await pAssertMenuItemDisabled(editor, 'Undo');
  });
});
