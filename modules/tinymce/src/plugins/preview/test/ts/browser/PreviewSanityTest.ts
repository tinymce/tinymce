import { Keyboard, Keys, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/preview/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.preview.PreviewSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'preview',
    toolbar: 'preview',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme, Plugin ]);

  const dialogSelector = 'div[role="dialog"]';
  const docBody = SugarElement.fromDom(document.body);

  const openDialog = async (editor: Editor) => {
    TinyUiActions.clickOnToolbar(editor, 'button');
    await TinyUiActions.pWaitForPopup(editor, '[role="dialog"] iframe');
  };

  it('TBA: Set content, open dialog, click Close to close dialog. Open dialog, press escape and assert dialog closes', async () => {
    const editor = hook.editor();
    editor.setContent('<strong>a</strong>');

    await openDialog(editor);
    // Close dialog with button
    TinyUiActions.clickOnUi(editor, '.tox-button:not(.tox-button--secondary)');
    await Waiter.pTryUntil('Dialog should close', () => UiFinder.notExists(docBody, dialogSelector));

    await openDialog(editor);
    // Close dialog with escape key
    Keyboard.keydown(Keys.escape(), { }, TinyDom.fromDom(document));
    await Waiter.pTryUntil('Dialog should close on esc', () => UiFinder.notExists(docBody, dialogSelector));
  });
});
