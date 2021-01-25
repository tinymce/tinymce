import { UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/anchor/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { pAddAnchor } from '../module/Helpers';

describe('browser.tinymce.plugins.anchor.AnchorAlertTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'anchor',
    toolbar: 'anchor',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);
  const dialogSelector = 'div[role="dialog"].tox-dialog';
  const alertDialogSelector = 'div[role="dialog"].tox-dialog.tox-alert-dialog';

  it('TINY-2788: Add anchor with invalid id, check alert appears', async () => {
    const editor = hook.editor();
    editor.setContent('');
    await pAddAnchor(editor, '');
    await TinyUiActions.pWaitForDialog(editor, alertDialogSelector);
    TinyUiActions.clickOnUi(editor, 'button.tox-button:contains(OK)');
    await Waiter.pTryUntil('Alert dialog should close', () => UiFinder.notExists(SugarBody.body(), alertDialogSelector));
    await Waiter.pTryUntil('Anchor Dialog should not close', () => UiFinder.exists(SugarBody.body(), dialogSelector));
    TinyUiActions.clickOnUi(editor, 'button.tox-button:contains(Cancel)');
    await Waiter.pTryUntil('Anchor Dialog should close', () => UiFinder.notExists(SugarBody.body(), dialogSelector));
    TinyAssertions.assertContent(editor, '');
  });
});
