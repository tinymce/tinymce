import { Assertions, Chain, GeneralSteps, Mouse, Pipeline, UiFinder, Waiter, FocusTools, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Body, Element } from '@ephox/sugar';
import WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import { setupDemo } from '../../../../demo/ts/components/DemoHelpers';
import { document } from '@ephox/dom-globals';
import { Types } from '@ephox/bridge';
import { Cell } from '@ephox/katamari';
import { TestHelpers } from '@ephox/alloy';

UnitTest.asynctest('WindowManager:simple-dialog Test', (success, failure) => {
  const helpers = setupDemo();
  const windowManager = WindowManager.setup(helpers.extras);

  const currentApi = Cell<Types.Dialog.DialogInstanceApi<any>>({ } as any);

  const store = TestHelpers.TestStore();

  const sTestOpen = Chain.asStep({ }, [
    Chain.mapper((_) => {
      return windowManager.open({
        title: 'Silver Test Modal Dialog',
        body: {
          type: 'panel',
          items: [
            {
              type: 'input',
              name: 'fred',
              label: 'Freds Input'
            },
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
        ],
        initialData: {
          fred: 'said hello pebbles'
        },
        onSubmit: store.adder('onSubmit'),
        onClose: store.adder('onClose'),
        onChange: store.adder('onChange'),
        onAction: store.adder('onAction')
      }, {}, () => store.adder('closeWindow')());
    }),

    Chain.op((dialogApi) => {
      Assertions.assertEq('Initial data', {
        fred: 'said hello pebbles'
      }, dialogApi.getData());

      currentApi.set(dialogApi);
    })
  ]);

  const sTestClose = GeneralSteps.sequence([
    Mouse.sClickOn(Body.body(), '[aria-label="Close"]'),
    UiFinder.sNotExists(Body.body(), '[role="dialog"]')
  ]);

  Pipeline.async({}, [
    sTestOpen,
    FocusTools.sTryOnSelector(
      'Focus should start on the input',
      Element.fromDom(document),
      'input'
    ),
    Step.sync(() => {
      currentApi.get().disable('barny');
    }),
    sTestClose,
    Waiter.sTryUntil(
      'Waiting for all dialog events when closing',
      store.sAssertEq('Checking stuff', [
        'closeWindow',
        'onClose',
      ]),
      100,
      3000
    )
  ], () => {
    helpers.destroy();
    success();
  }, failure);
});