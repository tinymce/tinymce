import { FocusTools, UiFinder, Waiter } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { Focus, Insert, Remove, SelectorFind, SugarBody, SugarDocument, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.throbber.ThrobberFocusTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, [ Theme ], true);

  before(() => {
    const editor = hook.editor();
    const input = SugarElement.fromHtml('<input id="tempInput" />');
    Insert.after(TinyDom.targetElement(editor), input);
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

  const setProgressState = (editor: Editor, state: boolean, time?: number) => {
    if (state) {
      editor.setProgressState(true, time);
    } else {
      editor.setProgressState(false);
    }
  };

  const pAssertThrobberVisible = async () => {
    await UiFinder.pWaitForVisible('Wait for throbber to show', SugarBody.body(), '.tox-throbber');
  };

  const pAssertThrobberHidden = async () => {
    await UiFinder.pWaitForHidden('Wait for throbber to hide', SugarBody.body(), '.tox-throbber');
  };

  const pAssertThrobberHasFocus = async () => {
    await FocusTools.pTryOnSelector('Throbber has focus', SugarDocument.getDocument(), 'div.tox-throbber__busy-spinner');
  };

  it('TINY-7373: should focus throbber when enabled and focus editor when disabled', async () => {
    const editor = hook.editor();
    setProgressState(editor, true);
    await pAssertThrobberVisible();
    await pAssertThrobberHasFocus();
    assert.isFalse(editor.hasFocus());
    setProgressState(editor, false);
    await pAssertThrobberHidden();
    assert.isTrue(editor.hasFocus());
  });

  it('TINY-7373: should not steal focus if editor is not focused when throbber is enabled', async () => {
    const editor = hook.editor();
    FocusTools.setFocus(SugarBody.body(), '#tempInput');

    setProgressState(editor, true);
    await pAssertThrobberVisible();
    await FocusTools.pTryOnSelector('Focus should remain on input (1)', SugarDocument.getDocument(), '#tempInput');

    setProgressState(editor, false);
    await pAssertThrobberHidden();
    await FocusTools.pTryOnSelector('Focus should remain on input (2)', SugarDocument.getDocument(), '#tempInput');
    assert.isFalse(editor.hasFocus());
  });

  it('TINY-7373: should take focus if editor.focus() is called', async () => {
    const editor = hook.editor();
    FocusTools.setFocus(SugarBody.body(), '#tempInput');

    setProgressState(editor, true);
    await pAssertThrobberVisible();
    await FocusTools.pTryOnSelector('Focus should remain on input (1)', SugarDocument.getDocument(), '#tempInput');

    editor.focus();
    await pAssertThrobberHasFocus();
    assert.isFalse(editor.hasFocus());

    setProgressState(editor, false);
    await pAssertThrobberHidden();
    assert.isTrue(editor.hasFocus());
  });

  it('TINY-7373: should have correct focus transitions when opening and closing dialog', async () => {
    const editor = hook.editor();

    openDialog(editor);
    TinyUiActions.pWaitForDialog(editor);
    await FocusTools.pTryOnSelector('Dialog input has focus (1)', SugarDocument.getDocument(), 'input.tox-textfield');

    setProgressState(editor, true);
    await pAssertThrobberVisible();
    // Throbber should not steal focus from the dialog
    await FocusTools.pTryOnSelector('Dialog input has focus (2)', SugarDocument.getDocument(), 'input.tox-textfield');

    TinyUiActions.cancelDialog(editor);
    await Waiter.pTryUntil('Anchor Dialog should close', () => UiFinder.notExists(SugarBody.body(), 'div[role="dialog"]'));
    // Throbber should get focus when dialog is closed instead of editor
    await pAssertThrobberHasFocus();

    setProgressState(editor, false);
    await pAssertThrobberHidden();
    // Focus returns to the editor when throbber is closed (this should happen since a dialog will normally focus the editor on close)
    assert.isTrue(editor.hasFocus());
  });

  // In theory, this combination shouldn't be possible as the user cannot click any buttons to open dialogs when the throbber is enabled
  // However, it is still important that all of the focus transitions make sense
  it('TINY-7373: should not set focus on the editor if the throbber did  not have focus when disabled', async () => {
    const editor = hook.editor();

    setProgressState(editor, true);
    await pAssertThrobberVisible();
    await pAssertThrobberHasFocus();

    openDialog(editor);
    TinyUiActions.pWaitForDialog(editor);
    await FocusTools.pTryOnSelector('Dialog input has focus (1)', SugarDocument.getDocument(), 'input.tox-textfield');

    // Disable the throbber when the dialog is open
    setProgressState(editor, false);
    await pAssertThrobberHidden();
    await FocusTools.pTryOnSelector('Dialog input has focus (2)', SugarDocument.getDocument(), 'input.tox-textfield');

    TinyUiActions.cancelDialog(editor);
    await Waiter.pTryUntil('Anchor Dialog should close', () => UiFinder.notExists(SugarBody.body(), 'div[role="dialog"]'));

    // Focus returns to the editor when the dialog is closed the throbber is not enabled
    assert.isTrue(editor.hasFocus());
  });

  it('TINY-7373: should have correct focus transitions when opening and closing notification', async () => {
    const editor = hook.editor();
    const notification = editor.notificationManager.open({
      text: 'Test',
      closeButton: true
    });
    const popup = await TinyUiActions.pWaitForPopup(editor, 'div.tox-notification') as SugarElement<HTMLElement>;
    Focus.focus(popup);
    await FocusTools.pTryOnSelector('Notification close button has focus', SugarDocument.getDocument(), 'button.tox-notification__dismiss');

    setProgressState(editor, true);
    await pAssertThrobberVisible();
    // Throbber should not steal focus from the notification
    await FocusTools.pTryOnSelector('Notification close button has focus', SugarDocument.getDocument(), 'button.tox-notification__dismiss');

    notification.close();
    await Waiter.pTryUntil('Notification should close', () => UiFinder.notExists(SugarBody.body(), 'div.tox-notification'));
    // Throbber should get focus when notification is closed instead of editor
    await pAssertThrobberHasFocus();

    setProgressState(editor, false);
    await pAssertThrobberHidden();
    // Focus returns to the editor when throbber is closed (this should happen since a dialog will normally focus the editor on close)
    assert.isTrue(editor.hasFocus());
  });
});
