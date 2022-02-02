import { ApproxStructure, Assertions, FocusTools, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Strings } from '@ephox/katamari';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import { WindowParams } from 'tinymce/core/api/WindowManager';
import Theme from 'tinymce/themes/silver/Theme';

import * as DialogUtils from '../../module/DialogUtils';

describe('browser.tinymce.themes.silver.window.SilverInlineDialogTest', () => {
  const store = TestHelpers.TestStore();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    '.tox-dialog { background: white; border: 2px solid black; padding: 1em; margin: 1em; }'
  ]);

  const dialogSpec: Dialog.DialogSpec<{ fred: string }> = {
    title: 'Silver Test Inline (Toolbar) Dialog',
    body: {
      type: 'panel',
      items: [
        {
          type: 'input',
          name: 'fred',
          label: 'Freds Input'
        }
      ]
    },
    buttons: [
      {
        type: 'custom',
        name: 'barny',
        text: 'Barny Text',
        align: 'start',
        primary: true
      },
      {
        type: 'custom',
        name: 'alert',
        text: 'Alert'
      },
      {
        type: 'custom',
        name: 'confirm',
        text: 'Confirm'
      }
    ],
    initialData: {
      fred: 'said hello pebbles'
    },
    onAction: (api, action) => {
      const editor = hook.editor();
      store.adder('onAction')();
      switch (action.name) {
        case 'alert':
          editor.windowManager.alert('Alert!');
          break;
        case 'confirm':
          editor.windowManager.confirm('Alert!');
          break;
      }
    }
  };

  const openDialog = (editor: Editor, params: WindowParams) => {
    const api = DialogUtils.openWithStore(editor, dialogSpec, params, store);
    assert.deepEqual(api.getData(), {
      fred: 'said hello pebbles'
    }, 'Initial data');
    return api;
  };

  const pTestAlertOrConfirm = async (editor: Editor, type: 'alert' | 'confirm') => {
    const buttonSelector = Strings.capitalize(type);
    const dialogSelector = `.tox-${type}-dialog`;
    store.clear();
    Mouse.trueClickOn(SugarBody.body(), '[role=dialog] button:contains(' + buttonSelector + ')');
    await TinyUiActions.pWaitForDialog(editor);
    store.assertEq('Checking onAction called', [ 'onAction' ]);
    Mouse.trueClickOn(SugarBody.body(), dialogSelector + ' .tox-dialog__footer button');
    await Waiter.pTryUntil('Wait for dialog to close', () => UiFinder.notExists(SugarBody.body(), dialogSelector));
  };

  beforeEach(() => {
    store.clear();
  });

  it('Modal dialog close events', async () => {
    const editor = hook.editor();
    const api = openDialog(editor, {});
    await FocusTools.pTryOnSelector(
      'Focus should start on the input',
      SugarDocument.getDocument(),
      'input'
    );
    api.disable('barny');
    DialogUtils.close(editor);
    await Waiter.pTryUntil(
      'Waiting for all dialog events when closing',
      () => store.assertEq('Checking stuff', [
        'onCancel',
        'onClose'
      ])
    );
  });

  it('Inline dialog close actions and events', async () => {
    const editor = hook.editor();
    openDialog(editor, { inline: 'toolbar' });
    await FocusTools.pTryOnSelector(
      'Focus should start on the input',
      SugarDocument.getDocument(),
      'input'
    );
    Assertions.assertStructure('"tox-dialog__scroll-disable" should not have been added to the body',
      ApproxStructure.build((s, str, arr) => s.element('body', {
        classes: [ arr.not('tox-dialog__disable-scroll') ]
      })),
      SugarBody.body()
    );

    // Ensure the dialog isn't dismissed when clicking on alert or confirm dialogs
    await pTestAlertOrConfirm(editor, 'alert');
    await pTestAlertOrConfirm(editor, 'confirm');
    store.clear();

    // Clicking elsewhere should close the dialog
    Mouse.trueClickOn(SugarBody.body(), 'root:body');
    await Waiter.pTryUntil(
      'Waiting for all dialog events when closing via dismiss',
      () => store.assertEq('Checking stuff', [
        'onCancel',
        'onClose'
      ])
    );
    UiFinder.notExists(SugarBody.body(), '[role="dialog"]');
  });
});
