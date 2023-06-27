import { ApproxStructure, Assertions, FocusTools, Keys, Mouse, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Arr, Strings } from '@ephox/katamari';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import { WindowParams } from 'tinymce/core/api/WindowManager';

import * as DialogUtils from '../../module/DialogUtils';

describe('browser.tinymce.themes.silver.window.SilverInlineDialogTest', () => {
  const store = TestStore();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    '.tox-dialog { background: white; border: 2px solid black; padding: 1em; margin: 1em; }'
  ]);

  const dialogSize: Dialog.DialogSize = 'normal';

  const createDialogSpec = (size?: Dialog.DialogSize): Dialog.DialogSpec<{ fred: string }> & { size?: Dialog.DialogSize } => {
    return {
      title: 'Silver Test Inline (Toolbar) Dialog',
      size: size || dialogSize,
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
            editor.windowManager.confirm('Confirm!');
            break;
        }
      }
    };
  };

  const dialogSpec = createDialogSpec();

  const openDialog = (
    editor: Editor,
    params: WindowParams,
    dialog: Dialog.DialogSpec<{ fred: string }> & { size?: Dialog.DialogSize } = dialogSpec
  ) => {
    const api = DialogUtils.openWithStore(editor, dialog, params, store);
    const { fred } = api.getData();
    assert.deepEqual({ fred }, { fred: 'said hello pebbles' }, 'Initial data');
    return api;
  };

  const pTestAlertOrConfirm = async (editor: Editor, type: 'alert' | 'confirm') => {
    const buttonSelector = Strings.capitalize(type);
    const dialogSelector = `.tox-${type}-dialog`;
    const body = SugarBody.body();

    store.clear();
    Mouse.trueClickOn(body, `[role=dialog] button:contains(${buttonSelector})`);
    await TinyUiActions.pWaitForDialog(editor);

    store.assertEq('Checking onAction called', [ 'onAction' ]);
    Mouse.trueClickOn(body, `${dialogSelector} .tox-dialog__footer button`);
    await Waiter.pTryUntil('Wait for dialog to close', () => UiFinder.notExists(body, dialogSelector));
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
    api.setEnabled('barny', false);
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

  Arr.each([
    { label: 'Modal', params: { }},
    { label: 'Inline toolbar', params: { inline: 'toolbar' as 'toolbar' }},
    { label: 'Inline cursor', params: { inline: 'cursor' as 'cursor' }},
  ], (test) => {
    it('TINY-9520: Modal focus testing for type: ' + test.label, async () => {
      const editor = hook.editor();
      openDialog(editor, test.params);
      await FocusTools.pTryOnSelector(
        'Focus should start on the input',
        SugarDocument.getDocument(),
        'input'
      );
      TinyUiActions.keydown(editor, Keys.tab());
      await FocusTools.pTryOnSelector(
        'Focus should be on barny button',
        SugarDocument.getDocument(),
        'button[title="Barny Text"]'
      );
      TinyUiActions.keydown(editor, Keys.tab());
      await FocusTools.pTryOnSelector(
        'Focus should be on alert button',
        SugarDocument.getDocument(),
        'button[title="Alert"]'
      );
      TinyUiActions.keydown(editor, Keys.tab());
      await FocusTools.pTryOnSelector(
        'Focus should be on confirm button',
        SugarDocument.getDocument(),
        'button[title="Confirm"]'
      );
      TinyUiActions.keydown(editor, Keys.tab());
      await FocusTools.pTryOnSelector(
        'Focus should be on x close button',
        SugarDocument.getDocument(),
        '.tox-button[title="Close"]'
      );
      DialogUtils.close(editor);
    });
  });

  Arr.each([
    { label: 'normal', size: 'normal' as Dialog.DialogSize, selector: '.tox-dialog-inline' },
    { label: 'medium', size: 'medium' as Dialog.DialogSize, selector: '.tox-dialog--width-md' },
    { label: 'large', size: 'large' as Dialog.DialogSize, selector: '.tox-dialog-inline--width-lg' },
  ], (test) => {
    it('inline dialog size tests, ' + test.label, () => {
      const editor = hook.editor();
      openDialog(editor, { inline: 'toolbar' }, createDialogSpec(test.size));
      UiFinder.exists(SugarBody.body(), test.selector);
      DialogUtils.close(editor);
    });
  });
});
