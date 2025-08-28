import { Keys, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/preview/Plugin';

describe('browser.tinymce.plugins.preview.PreviewSanityTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'preview',
    toolbar: 'preview',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const dialogSelector = 'div[role="dialog"]';
  const docBody = SugarBody.body();

  const pOpenDialog = async (editor: Editor) => {
    TinyUiActions.clickOnToolbar(editor, 'button');
    await TinyUiActions.pWaitForDialog(editor, '[role="dialog"] iframe');
  };

  it('TBA: Open dialog, click Close to close dialog', async () => {
    const editor = hook.editor();
    editor.setContent('<strong>a</strong>');
    await pOpenDialog(editor);
    TinyUiActions.closeDialog(editor);
    await Waiter.pTryUntil('Dialog should close', () => UiFinder.notExists(docBody, dialogSelector));

  });

  it('TBA: Open dialog, press escape to close dialog', async () => {
    const editor = hook.editor();
    editor.setContent('<strong>a</strong>');
    await pOpenDialog(editor);
    TinyUiActions.keyup(editor, Keys.escape());
    await Waiter.pTryUntil('Dialog should close on esc', () => UiFinder.notExists(docBody, dialogSelector));
  });

  const assertButtonNativelyEnabled = (editor: Editor, selector: string) => UiFinder.exists(TinyDom.container(editor), `[data-mce-name="${selector}"]:not([disabled="disabled"])`);
  const pAssertMenuItemEnabled = (editor: Editor, menuItemLabel: string) => TinyUiActions.pWaitForUi(editor, `[role="menuitem"][aria-label="${menuItemLabel}"][aria-disabled="false"]`);

  it('TINY-11264: Preview toolbar button and menu item should be enabled at all time', async () => {
    const editor = hook.editor();

    assertButtonNativelyEnabled(editor, 'preview');
    TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("View")');
    await pAssertMenuItemEnabled(editor, 'Preview');
    TinyUiActions.keystroke(editor, Keys.escape());

    editor.mode.set('readonly');
    assertButtonNativelyEnabled(editor, 'preview');
    TinyUiActions.clickOnMenu(editor, '.tox-mbtn:contains("View")');
    await pAssertMenuItemEnabled(editor, 'Preview');
    TinyUiActions.keystroke(editor, Keys.escape());

    editor.mode.set('design');
  });

  it('TINY-11264: Preview dialog cancel button should be enabled at all time', async () => {
    const editor = hook.editor();

    editor.mode.set('readonly');
    TinyUiActions.clickOnToolbar(editor, '[data-mce-name="preview"]');
    await TinyUiActions.pWaitForDialog(editor);
    UiFinder.exists(SugarBody.body(), `[data-mce-name="Close"]:not([disabled="disabled"])`);
    TinyUiActions.closeDialog(editor);

    editor.mode.set('design');
  });
});
