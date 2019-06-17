import { ApproxStructure, Assertions, Chain, GeneralSteps, Mouse, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Body } from '@ephox/sugar';
import WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import { Types } from '@ephox/bridge';
import { Cell } from '@ephox/katamari';
import { TestHelpers } from '@ephox/alloy';
import TestExtras from '../../module/TestExtras';

UnitTest.asynctest('WindowManager:url-dialog Test', (success, failure) => {
  const helpers = TestExtras();
  const windowManager = WindowManager.setup(helpers.extras);

  const currentApi = Cell<Types.UrlDialog.UrlDialogInstanceApi>({ } as any);

  const store = TestHelpers.TestStore();

  const sTestOpen = Chain.asStep({ }, [
    Chain.mapper((_) => {
      return windowManager.openUrl({
        title: 'Silver Test Modal URL Dialog',
        url: '/project/tinymce/src/themes/silver/test/html/iframe.html',
        buttons: [
          {
            type: 'custom',
            name: 'barny',
            text: 'Barny Text',
            align: 'start',
            primary: true
          },
        ],
        onClose: store.adder('onClose'),
        onAction: store.adder('onAction'),
        onMessage: store.adder('onMessage')
      }, () => store.adder('closeWindow')());
    }),

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
      ApproxStructure.build((s, str, arr) => {
        return s.element('body', {
          classes: [ arr.has('tox-dialog__disable-scroll') ]
        });
      }),
      Body.body()
    ),
    Waiter.sTryUntil(
      'Waiting for an initial message to be received from the iframe',
      store.sAssertEq('Checking stuff', [ 'onMessage' ]),
      100,
      3000
    ),
    Step.label('Sending message to iframe', Step.sync(() => {
      // Send a message to the iframe
      currentApi.get().sendMessage({ message: 'Some message' });
    })),
    Waiter.sTryUntil(
      'Waiting for the reply message to be received from the iframe',
      store.sAssertEq('Checking stuff', [ 'onMessage', 'onMessage' ]),
      100,
      3000
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
      ]),
      100,
      3000
    ),
    Assertions.sAssertStructure('"tox-dialog__scroll-disable" should have been removed from the body',
      ApproxStructure.build((s, str, arr) => {
        return s.element('body', {
          classes: [ arr.not('tox-dialog__disable-scroll') ]
        });
      }),
      Body.body()
    ),
  ], () => {
    helpers.destroy();
    success();
  }, failure);
});