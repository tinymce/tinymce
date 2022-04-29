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

  const assertToolbarButtonState = (title: string, disabled: boolean) =>
    UiFinder.exists(SugarBody.body(), `button[title="${title}"][aria-disabled="${disabled}"]`);

  const assertMenuItemState = (editor: Editor, item: string, disabled: boolean) =>
    TinyUiActions.pWaitForUi(editor, `div[title="${item}"][role="menuitem"][aria-disabled="${disabled}"]`);

  const pWaitForToolbarState = async (editor: Editor, disabled: boolean) => {
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
    assertToolbarButtonState('Redo', true);
    assertToolbarButtonState('Undo', true);
    TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
    await assertMenuItemState(editor, 'Redo', true);
    await assertMenuItemState(editor, 'Undo', true);
    TinyUiActions.keyup(hook.editor(), Keys.escape());
  });

  it('TINY-8101: Undo/redo should be disabled/enabled if dirty', async () => {
    const editor = hook.editor();
    // 1. Insert content, undo should be enabled and redo should be still disabled
    editor.resetContent('');
    editor.insertContent('<p>test</p>');
    assertToolbarButtonState('Redo', true);
    assertToolbarButtonState('Undo', false);
    TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
    await assertMenuItemState(editor, 'Redo', true);
    await assertMenuItemState(editor, 'Undo', false);
    TinyUiActions.keyup(hook.editor(), Keys.escape());

    // 2. Redo should be enabled after undo being clicked
    TinyUiActions.clickOnToolbar(editor, '.tox-tbtn[title="Undo"]');
    assertToolbarButtonState('Redo', false);
    assertToolbarButtonState('Undo', true);
    TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
    await assertMenuItemState(editor, 'Redo', false);
    await assertMenuItemState(editor, 'Undo', true);
    TinyUiActions.keyup(hook.editor(), Keys.escape());
  });

  it('TINY-8101: Undo/redo are always disabled in readonly mode', async () => {
    const editor = hook.editor();
    // 1. Insert content to add an undo state
    editor.resetContent('');
    editor.insertContent('<p>test</p');

    // 2. switch to readonly mode
    editor.mode.set('readonly');
    await pWaitForToolbarState(editor, true);
    assertToolbarButtonState('Redo', true);
    assertToolbarButtonState('Undo', true);

    // 3. switch back to design mode. Expect undo to be re-enabled
    editor.mode.set('design');
    await pWaitForToolbarState(editor, false);
    assertToolbarButtonState('Redo', true);
    assertToolbarButtonState('Undo', false);
    TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
    await assertMenuItemState(editor, 'Redo', true);
    await assertMenuItemState(editor, 'Undo', false);
  });
});
