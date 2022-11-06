import { ApproxStructure, Assertions, Mouse, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';

import { Dialog } from 'tinymce/core/api/ui/Ui';
import { WindowManagerImpl } from 'tinymce/core/api/WindowManager';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import * as TestExtras from '../../module/TestExtras';

describe('headless.tinymce.themes.silver.window.SilverUrlDialogTest', () => {
  const store = TestStore();
  const extrasHook = TestExtras.bddSetup();
  let windowManager: WindowManagerImpl;
  let dialogApi: Dialog.UrlDialogInstanceApi;
  before(() => {
    windowManager = WindowManager.setup(extrasHook.access().extras);
  });

  const openDialog = () => {
    dialogApi = windowManager.openUrl({
      title: 'Silver Test Modal URL Dialog',
      url: '/project/tinymce/src/themes/silver/test/html/iframe.html',
      buttons: [
        {
          type: 'custom',
          name: 'barny',
          text: 'Barny Text',
          align: 'start',
          primary: true
        }
      ],
      onClose: store.adder('onClose'),
      onAction: store.adder('onAction'),
      onMessage: store.adder('onMessage')
    }, () => store.adder('closeWindow')());
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

  it('Open a dialog, send message, close and assert events', async () => {
    openDialog();
    assertScrollLock(true);
    await Waiter.pTryUntil(
      'Waiting for an initial message to be received from the iframe',
      () => store.assertEq('Checking stuff', [ 'onMessage' ])
    );
    // Send a message to the iframe
    dialogApi.sendMessage({ message: 'Some message' });
    await Waiter.pTryUntil(
      'Waiting for the reply message to be received from the iframe',
      () => store.assertEq('Checking stuff', [ 'onMessage', 'onMessage' ])
    );
    Mouse.clickOn(SugarBody.body(), 'button:contains("Barny Text")');
    closeDialog();
    await Waiter.pTryUntil(
      'Waiting for all dialog events when closing',
      () => store.assertEq('Checking stuff', [
        'onMessage',
        'onMessage',
        'onAction',
        'closeWindow',
        'onClose'
      ])
    );
    assertScrollLock(false);
  });
});
