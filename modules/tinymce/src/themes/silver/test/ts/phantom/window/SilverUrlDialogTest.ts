import { ApproxStructure, Assertions, Chain, GeneralSteps, Mouse, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';

import { Types } from '@ephox/bridge';
import { Cell } from '@ephox/katamari';
import { Body } from '@ephox/sugar';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';
import TestExtras from '../../module/TestExtras';

UnitTest.asynctest('WindowManager:url-dialog Test', (success, failure) => {
  const helpers = TestExtras();
  const windowManager = WindowManager.setup(helpers.extras);

  const currentApi = Cell<Types.UrlDialog.UrlDialogInstanceApi>({ } as any);

  const store = TestHelpers.TestStore();

  const sTestOpen = Chain.asStep({ }, [
    Chain.injectThunked(() => windowManager.openUrl({
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
    }, () => store.adder('closeWindow')())),

    Chain.op((dialogApi) => {
      currentApi.set(dialogApi);
    })
  ]);

  const sTestClose = GeneralSteps.sequence([
    Mouse.sClickOn(Body.body(), '[aria-label="Close"]'),
    UiFinder.sNotExists(Body.body(), '[role="dialog"]')
  ]);

  Pipeline.async({}, [
    sTestOpen,
    Assertions.sAssertStructure('"tox-dialog__scroll-disable" should exist on the body',
      ApproxStructure.build((s, str, arr) => s.element('body', {
        classes: [ arr.has('tox-dialog__disable-scroll') ]
      })),
      Body.body()
    ),
    Waiter.sTryUntil(
      'Waiting for an initial message to be received from the iframe',
      store.sAssertEq('Checking stuff', [ 'onMessage' ])
    ),
    Step.label('Sending message to iframe', Step.sync(() => {
      // Send a message to the iframe
      currentApi.get().sendMessage({ message: 'Some message' });
    })),
    Waiter.sTryUntil(
      'Waiting for the reply message to be received from the iframe',
      store.sAssertEq('Checking stuff', [ 'onMessage', 'onMessage' ])
    ),
    Mouse.sClickOn(Body.body(), 'button:contains("Barny Text")'),
    sTestClose,
    Waiter.sTryUntil(
      'Waiting for all dialog events when closing',
      store.sAssertEq('Checking stuff', [
        'onMessage',
        'onMessage',
        'onAction',
        'closeWindow',
        'onClose'
      ])
    ),
    Assertions.sAssertStructure('"tox-dialog__scroll-disable" should have been removed from the body',
      ApproxStructure.build((s, str, arr) => s.element('body', {
        classes: [ arr.not('tox-dialog__disable-scroll') ]
      })),
      Body.body()
    )
  ], () => {
    helpers.destroy();
    success();
  }, failure);
});
