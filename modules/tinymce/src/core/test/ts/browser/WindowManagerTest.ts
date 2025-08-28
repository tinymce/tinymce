import { FocusTools, Mouse } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { WindowEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

describe('browser.tinymce.core.WindowManagerTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  it('OpenWindow/CloseWindow events', () => {
    const editor = hook.editor();
    let openWindowArgs: EditorEvent<WindowEvent<any>> | undefined;
    let closeWindowArgs: EditorEvent<WindowEvent<any>> | undefined;

    editor.on('CloseWindow', (e) => {
      closeWindowArgs = e;
    });

    editor.on('OpenWindow', (e) => {
      openWindowArgs = e;
      editor.windowManager.close();
    });

    editor.windowManager.open({
      title: 'Find and Replace',
      body: {
        type: 'panel',
        items: []
      },
      buttons: []
    });

    assert.equal(openWindowArgs?.type, 'openwindow');
    assert.equal(closeWindowArgs?.type, 'closewindow');

    editor.off('CloseWindow OpenWindow');
  });

  const openDialog = (editor: Editor) => {
    editor.windowManager.open({
      title: 'Dialog 1',
      body: {
        type: 'panel',
        items: [
          {
            type: 'button',
            text: 'confirm',
            name: 'confirm'
          },
          {
            type: 'button',
            text: 'alert',
            name: 'alert'
          },
          {
            type: 'button',
            text: 'dialog',
            name: 'dialog'
          }
        ]
      },
      buttons: [],
      onAction: (_, button: { name: string }) => {
        if (button.name === 'confirm') {
          editor.windowManager.confirm('Ok?', Fun.noop);
        }
        if (button.name === 'alert') {
          editor.windowManager.alert('This is an alert');
        }
        if (button.name === 'dialog') {
          editor.windowManager.open({
            title: 'Dialog 2',
            body: {
              type: 'panel',
              items: [
                {
                  type: 'input',
                  name: 'input',
                }
              ]
            },
            buttons: []
          });
        }
      }
    });
  };

  it('TINY-12038: Focus is restored to the dialog after closing confirmation dialog', async () => {
    const editor = hook.editor();
    openDialog(editor);
    await TinyUiActions.pWaitForDialogByTitle(editor, 'Dialog 1');
    const triggerButtonSelector = '[role="dialog"] button[data-mce-name="confirm"]';

    Mouse.trueClickOn(SugarBody.body(), triggerButtonSelector);
    await TinyUiActions.pWaitForPopup(editor, '.tox-confirm-dialog');
    await FocusTools.pTryOnSelector('Focus should be inside confirmation dialog', SugarDocument.getDocument(), '[role="dialog"].tox-confirm-dialog button:contains("Yes")');
    TinyUiActions.clickOnUi(editor, '[role="dialog"].tox-confirm-dialog button:contains("Yes")');

    await FocusTools.pTryOnSelector('Focus should be restored to the trigger button', SugarDocument.getDocument(), triggerButtonSelector);
    TinyUiActions.closeDialogByTitle(editor, 'Dialog 1');
  });

  it('TINY-12038: Focus is restored to the dialog after closing an alert', async () => {
    const editor = hook.editor();
    openDialog(editor);
    await TinyUiActions.pWaitForDialogByTitle(editor, 'Dialog 1');
    const triggerButtonSelector = '[role="dialog"] button[data-mce-name="alert"]';

    Mouse.trueClickOn(SugarBody.body(), triggerButtonSelector);
    await TinyUiActions.pWaitForPopup(editor, '.tox-alert-dialog');
    await FocusTools.pTryOnSelector('Focus should be inside alert dialog', SugarDocument.getDocument(), '[role="dialog"].tox-alert-dialog button:contains("OK")');
    TinyUiActions.clickOnUi(editor, '[role="dialog"].tox-alert-dialog button:contains("OK")');

    await FocusTools.pTryOnSelector('Focus should be restored to the trigger button', SugarDocument.getDocument(), triggerButtonSelector);
    TinyUiActions.closeDialogByTitle(editor, 'Dialog 1');
  });

  it('TINY-12038: Focus is restored to the dialog after closing second dialog', async () => {
    const editor = hook.editor();
    openDialog(editor);
    await TinyUiActions.pWaitForDialogByTitle(editor, 'Dialog 1');
    const triggerButtonSelector = '[role="dialog"] button[data-mce-name="dialog"]';

    Mouse.trueClickOn(SugarBody.body(), triggerButtonSelector);
    await TinyUiActions.pWaitForDialogByTitle(editor, 'Dialog 2');
    await FocusTools.pTryOnSelector('Focus should be inside Dialog 2', SugarDocument.getDocument(), 'input');
    TinyUiActions.closeDialogByTitle(editor, 'Dialog 2');

    await FocusTools.pTryOnSelector('Focus should be restored to the trigger button', SugarDocument.getDocument(), triggerButtonSelector);
    TinyUiActions.closeDialogByTitle(editor, 'Dialog 1');
  });
});
