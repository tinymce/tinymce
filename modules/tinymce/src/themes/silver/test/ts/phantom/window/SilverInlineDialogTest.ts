import { ApproxStructure, Assertions, Chain, GeneralSteps, Mouse, Pipeline, UiFinder, Waiter, Step, FocusTools, Logger } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Body, Element } from '@ephox/sugar';
import WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import { document } from '@ephox/dom-globals';
import { Cell } from '@ephox/katamari';
import { Types } from '@ephox/bridge';
import { Channels, TestHelpers } from '@ephox/alloy';
import TestExtras from '../../module/TestExtras';

UnitTest.asynctest('WindowManager:inline-dialog Test', (success, failure) => {
  const helpers = TestExtras();
  const windowManager = WindowManager.setup(helpers.extras);

  const store = TestHelpers.TestStore();

  const currentApi = Cell<Types.Dialog.DialogInstanceApi<any>>({ } as any);

  const sTestOpen = (params) => Chain.asStep({ }, [
    Chain.mapper((_) => {
      const dialogSpec: Types.Dialog.DialogApi<{ fred: string }> = {
        title: 'Silver Test Inline (Toolbar) Dialog',
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
        onCancel: store.adder('onCancel'),
        onChange: store.adder('onChange'),
        onAction: store.adder('onAction')
      };
      return windowManager.open(dialogSpec, params, store.adder('closeWindow'));
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
    TestHelpers.GuiSetup.mAddStyles(Element.fromDom(document), [
      '.tox-dialog { background: white; border: 2px solid black; padding: 1em; margin: 1em; }'
    ]),
    sTestOpen({ inline: 'magic' }),
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
        'onCancel',
        'closeWindow',
        'onClose'
      ]),
      100,
      3000
    ),

    store.sClear,

    sTestOpen({ inline: 'toolbar' }),
    FocusTools.sTryOnSelector(
      'Focus should start on the input',
      Element.fromDom(document),
      'input'
    ),
    Assertions.sAssertStructure('"tox-dialog__scroll-disable" should not have been added to the body',
      ApproxStructure.build((s, str, arr) => {
        return s.element('body', {
          classes: [ arr.not('tox-dialog__disable-scroll') ]
        });
      }),
      Body.body()
    ),
    Step.sync(() => {
      helpers.uiMothership.broadcastOn([ Channels.dismissPopups() ], {
        target: Body.body()
      });
    }),
    Waiter.sTryUntil(
      'Waiting for all dialog events when closing via dismiss',
      store.sAssertEq('Checking stuff', [
        'onCancel',
        'closeWindow',
        'onClose'
      ]),
      100,
      3000
    ),
    Logger.t(
      'After broadcasting dismiss, dialog should be removed',
      UiFinder.sNotExists(Body.body(), '[role="dialog"]')
    ),
    TestHelpers.GuiSetup.mRemoveStyles
  ], () => {
    helpers.destroy();
    success();
  }, failure);
});