import { ApproxStructure, Assertions, Chain, GeneralSteps, Mouse, Pipeline, UiFinder, Waiter, FocusTools, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Body, Element } from '@ephox/sugar';
import WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import { document } from '@ephox/dom-globals';
import { Types } from '@ephox/bridge';
import { Cell } from '@ephox/katamari';
import { TestHelpers } from '@ephox/alloy';
import TestExtras from '../../module/TestExtras';

UnitTest.asynctest('WindowManager:simple-dialog Test', (success, failure) => {
  const helpers = TestExtras();
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
    Assertions.sAssertStructure('"tox-dialog__scroll-disable" should exist on the body',
      ApproxStructure.build((s, str, arr) => {
        return s.element('body', {
          classes: [ arr.has('tox-dialog__disable-scroll') ]
        });
      }),
      Body.body()
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
      ])
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
