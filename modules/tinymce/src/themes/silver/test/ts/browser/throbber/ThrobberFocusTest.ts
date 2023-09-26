import { FocusTools, UiFinder, Waiter } from '@ephox/agar';
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { Focus, Insert, Remove, SelectorFind, SugarBody, SugarDocument, SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.throbber.ThrobberFocusTest', () => {
  const pAssertFocus = (label: string, selector: string) =>
    FocusTools.pTryOnSelector(label, SugarDocument.getDocument(), selector);

  const pAssertThrobberVisible = () =>
    UiFinder.pWaitForVisible('Wait for throbber to show', SugarBody.body(), '.tox-throbber');

  const pEnableThrobber = async (editor: Editor, pAssertFocus: () => Promise<SugarElement>) => {
    editor.setProgressState(true);
    await pAssertThrobberVisible();
    await pAssertFocus();
  };

  const pAssertThrobberFocus = () =>
    pAssertFocus('Throbber has focus', 'div.tox-throbber__busy-spinner');

  context('Editor is fully visible', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce'
    }, [], true);

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

    const pAssertThrobberHidden = () =>
      UiFinder.pWaitForHidden('Wait for throbber to hide', SugarBody.body(), '.tox-throbber');

    const pAssertInputFocus = () =>
      pAssertFocus('Focus on input', '#tempInput');

    const pDisableThrobber = async (editor: Editor, pAssertFocus: () => Promise<SugarElement>) => {
      editor.setProgressState(false);
      await pAssertThrobberHidden();
      await pAssertFocus();
    };

    const pAssertEditorFocus = (editor: Editor) => () =>
      pAssertFocus('Editor has focus', editor.inline ? 'div.mce-edit-focus' : 'iframe.tox-edit-area__iframe');

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

    it('TINY-7373: should not take focus if editor.focus(true) is called', async () => {
      const editor = hook.editor();

      FocusTools.setFocus(SugarBody.body(), '#tempInput');
      await pEnableThrobber(editor, pAssertInputFocus);

      editor.focus(true);
      await pAssertInputFocus();
      assert.isFalse(editor.hasFocus());
      editor.focus();
      await pAssertThrobberFocus();

      await pDisableThrobber(editor, pAssertEditorFocus(editor));
      assert.isTrue(editor.hasFocus());
    });

    it('TINY-7373: should have correct focus transitions when opening and closing dialog', async () => {
      const editor = hook.editor();
      const pAssertDialogFocus = () => pAssertFocus('Dialog input has focus', 'input.tox-textfield');

      openDialog(editor);
      await TinyUiActions.pWaitForDialog(editor);
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

    it('TINY-7373: should not set focus on the editor if the throbber did not have focus when disabled', async () => {
      const editor = hook.editor();
      const pAssertDialogFocus = () => pAssertFocus('Dialog input has focus', 'input.tox-textfield');

      await pEnableThrobber(editor, pAssertThrobberFocus);
      openDialog(editor);
      await TinyUiActions.pWaitForDialog(editor);
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

    it('TINY-7602: should not steal focus if target element inside the editor body has "mce-pastebin" class', async () => {
      const editor = hook.editor();
      const editorBody = TinyDom.body(editor);
      const normalDiv = SugarElement.fromHtml<HTMLElement>('<div class="not-pastebin" contenteditable="true" data-mce-bogus="all">&nbsp;</div>');
      const fakePasteBin = SugarElement.fromHtml<HTMLElement>('<div class="mce-pastebin" contenteditable="true" data-mce-bogus="all">&nbsp;</div>');

      Insert.append(editorBody, normalDiv);
      Insert.append(editorBody, fakePasteBin);
      await pEnableThrobber(editor, pAssertThrobberFocus);
      FocusTools.setFocus(SugarBody.body(), '#tempInput');
      await pAssertInputFocus();

      // Note: Ideally we would like to actually focus the divs with Focus.focus.
      // Unfortunately, other focus events end up firing with this and as such
      // by the time we get to the assertion, the focus may have shifted back to
      // the throbber. As a result, the best we can do is trigger fake events and
      // ensure the throbber logic acts as expected

      // Make sure throbber doesn't take focus when the pastebin is the target
      editor.dom.dispatch(fakePasteBin.dom, 'focusin');
      await pAssertInputFocus();
      // Make sure throbber takes focus when the target is not a pastebin
      editor.dom.dispatch(normalDiv.dom, 'focusin');
      await pAssertThrobberFocus();

      // Focus should return back to editor when throbber is closed
      await pDisableThrobber(editor, pAssertEditorFocus(editor));
      assert.isTrue(editor.hasFocus());
      // Clean up
      Remove.remove(fakePasteBin);
      Remove.remove(normalDiv);
    });
  });

  context('Editor is not fully visible on the page', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      height: 400,
    }, [], true);

    it('TINY-10172: Should not scroll the page when the editor is not fully visible in the screen', async () => {
      const editor = hook.editor();
      editor.getContainer().style.marginTop = '800px';
      const doc = editor.getContainer().ownerDocument;
      const maxScrollY = doc.documentElement.scrollHeight - doc.documentElement.clientHeight;
      doc.defaultView?.scroll({
        top: maxScrollY - 200,
      });
      const initialScroll = doc.defaultView?.scrollY;
      await pEnableThrobber(editor, pAssertThrobberFocus);
      assert.equal(initialScroll, doc.defaultView?.scrollY);
    });
  });
});
