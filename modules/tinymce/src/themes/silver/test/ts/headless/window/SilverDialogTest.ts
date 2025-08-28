import { ApproxStructure, Assertions, FocusTools, Mouse, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { assert } from 'chai';

import { Dialog } from 'tinymce/core/api/ui/Ui';
import { WindowManagerImpl } from 'tinymce/core/api/WindowManager';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import * as TestExtras from '../../module/TestExtras';

describe('headless.tinymce.themes.silver.window.SilverDialogTest', () => {
  const store = TestStore();
  const extrasHook = TestExtras.bddSetup();
  let windowManager: WindowManagerImpl;
  let dialogApi: Dialog.DialogInstanceApi<any>;
  before(() => {
    windowManager = WindowManager.setup(extrasHook.access().extras);
  });

  const openDialogAndAssertInitialData = () => {
    dialogApi = windowManager.open({
      title: 'Silver Test Modal Dialog',
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
        }
      ],
      initialData: {
        fred: 'said hello pebbles'
      },
      onSubmit: store.adder('onSubmit'),
      onClose: store.adder('onClose'),
      onChange: store.adder('onChange'),
      onAction: store.adder('onAction')
    }, {}, () => store.adder('closeWindow')());

    assert.deepEqual(dialogApi.getData(), {
      fred: 'said hello pebbles'
    }, 'Initial data');
  };

  const closeDialog = () => {
    Mouse.clickOn(SugarBody.body(), '[aria-label="Close"]');
    UiFinder.notExists(SugarBody.body(), '[role="dialog"]');
  };

  const assertScrollLock = (enabled: boolean) => {
    Assertions.assertStructure(`"tox-dialog__scroll-disable" ${enabled ? 'should' : 'should not'} exist on the body`,
      ApproxStructure.build((s, str, arr) => s.element('body', {
        classes: [ enabled ? arr.has('tox-dialog__disable-scroll') : arr.not('tox-dialog__disable-scroll') ]
      })),
      SugarBody.body()
    );
  };

  it('Open a dialog, assert initial focus, close and assert events', async () => {
    openDialogAndAssertInitialData();
    await FocusTools.pTryOnSelector(
      'Focus should start on the input',
      SugarDocument.getDocument(),
      'input'
    );
    assertScrollLock(true);
    dialogApi.setEnabled('barny', false);
    closeDialog();
    await Waiter.pTryUntil(
      'Waiting for all dialog events when closing',
      () => store.assertEq('Checking stuff', [
        'closeWindow',
        'onClose'
      ])
    );
    assertScrollLock(false);
  });
});
