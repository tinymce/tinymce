import { FocusTools, UiFinder, Waiter } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { Focus, Insert, Remove, SelectorFind, SugarBody, SugarDocument, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.throbber.ThrobberFocusTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ], true);

  before(() => {
    const input = SugarElement.fromHtml('<input id="tempInput" />');
    Insert.append(SugarBody.body(), input);
  });

  after(() => {
    Remove.remove(SelectorFind.descendant(SugarBody.body(), '#tempInput').getOrDie());
  });

  const openDialog = (editor: Editor) => {
    return editor.windowManager.open({
      title: 'Sample Dialog',
      body: {
        type: 'panel',
        items: [
          {
            name: 'id',
            type: 'input',
            label: 'ID'
          }
        ]
      },
      buttons: [
        {
          type: 'cancel',
          name: 'cancel',
          text: 'Cancel'
        },
        {
          type: 'submit',
          name: 'save',
          text: 'Save',
          primary: true
        }
      ],
    });
  };

  const pAssertThrobberVisible = () =>
    UiFinder.pWaitForVisible('Wait for throbber to show', SugarBody.body(), '.tox-throbber');

  const pAssertThrobberHidden = () =>
    UiFinder.pWaitForHidden('Wait for throbber to hide', SugarBody.body(), '.tox-throbber');

  const pAssertFocus = (label: string, selector: string) =>
    FocusTools.pTryOnSelector(label, SugarDocument.getDocument(), selector);

  const pAssertThrobberFocus = () =>
    pAssertFocus('Throbber has focus', 'div.tox-throbber__busy-spinner');

  const pAssertEditorFocus = (editor: Editor) => () =>
    pAssertFocus('Editor has focus', editor.inline ? 'div.mce-edit-focus' : 'iframe.tox-edit-area__iframe');

  const pEnableThrobber = async (editor: Editor, pAssertFocus: () => Promise<SugarElement>) => {
    editor.setProgressState(true);
    await pAssertThrobberVisible();
    await pAssertFocus();
  };

  const pDisableThrobber = async (editor: Editor, pAssertFocus: () => Promise<SugarElement>) => {
    editor.setProgressState(false);
    await pAssertThrobberHidden();
    await pAssertFocus();
  };

  it('TINY-7373: should focus throbber when enabled and focus editor when disabled', async () => {
    const editor = hook.editor();
    await pEnableThrobber(editor, pAssertThrobberFocus);
    assert.isFalse(editor.hasFocus());
    await pDisableThrobber(editor, pAssertEditorFocus(editor));
    assert.isTrue(editor.hasFocus());
  });

  it('TINY-7373: should not steal focus if editor is not focused when throbber is enabled', async () => {
    const editor = hook.editor();
    const pAssertInputFocus = () => pAssertFocus('Focus on input', '#tempInput');

    FocusTools.setFocus(SugarBody.body(), '#tempInput');
    await pEnableThrobber(editor, pAssertInputFocus);

    await pDisableThrobber(editor, pAssertInputFocus);
    assert.isFalse(editor.hasFocus());
  });

  it('TINY-7373: should take focus if editor.focus() is called', async () => {
    const editor = hook.editor();

    editor.focus();
    await pEnableThrobber(editor, pAssertThrobberFocus);
    editor.focus();
    await pAssertThrobberFocus();
    assert.isFalse(editor.hasFocus());

    await pDisableThrobber(editor, pAssertEditorFocus(editor));
    assert.isTrue(editor.hasFocus());
  });

  it('TINY-7373: should have correct focus transitions when opening and closing dialog', async () => {
    const editor = hook.editor();
    const pAssertDialogFocus = () => pAssertFocus('Dialog input has focus', 'input.tox-textfield');

    openDialog(editor);
    TinyUiActions.pWaitForDialog(editor);
    await pAssertDialogFocus();

    // Throbber should not steal focus from the dialog
    await pEnableThrobber(editor, pAssertDialogFocus);

    // Throbber should get focus when dialog is closed instead of editor
    TinyUiActions.cancelDialog(editor);
    await Waiter.pTryUntil('Dialog should close', () => UiFinder.notExists(SugarBody.body(), 'div[role="dialog"]'));
    await pAssertThrobberFocus();

    // Focus returns to the editor when throbber is closed (this should happen since a dialog will normally focus the editor on close)
    await pDisableThrobber(editor, pAssertEditorFocus(editor));
    assert.isTrue(editor.hasFocus());
  });

  // In theory, this combination shouldn't be possible as the user cannot click any buttons to open dialogs when the throbber is enabled
  // However, it is still important that all of the focus transitions make sense
  it('TINY-7373: should not set focus on the editor if the throbber did not have focus when disabled', async () => {
    const editor = hook.editor();
    const pAssertDialogFocus = () => pAssertFocus('Dialog input has focus', 'input.tox-textfield');

    await pEnableThrobber(editor, pAssertThrobberFocus);
    openDialog(editor);
    TinyUiActions.pWaitForDialog(editor);
    await pAssertDialogFocus();

    // Disable the throbber when the dialog is open
    await pDisableThrobber(editor, pAssertDialogFocus);

    // Focus returns to the editor when the dialog is closed the throbber is not enabled
    TinyUiActions.cancelDialog(editor);
    await Waiter.pTryUntil('Dialog should close', () => UiFinder.notExists(SugarBody.body(), 'div[role="dialog"]'));
    assert.isTrue(editor.hasFocus());
  });

  it('TINY-7373: should have correct focus transitions when opening and closing notification', async () => {
    const editor = hook.editor();
    const pAssertNotificationFocus = () => pAssertFocus('Notification close button has focus', 'button.tox-notification__dismiss');

    const notification = editor.notificationManager.open({
      text: 'Test',
      closeButton: true
    });
    const popup = await TinyUiActions.pWaitForPopup(editor, 'div.tox-notification') as SugarElement<HTMLElement>;
    Focus.focus(popup);
    await pAssertNotificationFocus();

    // Throbber should not steal focus from the notification
    await pEnableThrobber(editor, pAssertNotificationFocus);

    // Throbber should get focus when notification is closed instead of editor
    notification.close();
    await Waiter.pTryUntil('Notification should close', () => UiFinder.notExists(SugarBody.body(), 'div.tox-notification'));
    await pAssertThrobberFocus();

    // Focus returns to the editor when throbber is closed (this should happen since a dialog will normally focus the editor on close)
    await pDisableThrobber(editor, pAssertEditorFocus(editor));
    assert.isTrue(editor.hasFocus());
  });
});
