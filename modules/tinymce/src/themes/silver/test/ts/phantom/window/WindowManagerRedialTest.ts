import { Assertions, Chain, GeneralSteps, Logger, Mouse, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Types } from '@ephox/bridge';
import { console } from '@ephox/dom-globals';
import { Cell } from '@ephox/katamari';
import { Body, Value } from '@ephox/sugar';
import WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import { TestHelpers } from '@ephox/alloy';
import TestExtras from '../../module/TestExtras';

UnitTest.asynctest('WindowManager:redial Test', (success, failure) => {
  const helpers = TestExtras();
  const windowManager = WindowManager.setup(helpers.extras);

  const currentDialogApi = Cell<Types.Dialog.DialogInstanceApi<any>>({ } as any);

  const store = TestHelpers.TestStore();

  const dialogA: Types.Dialog.DialogApi<any> = {
    title: 'DialogA',
    body: {
      type: 'panel',
      items: [
      ]
    },
    buttons: [
      {
        type: 'custom',
        name: 'Dest.DialogB',
        text: 'Destination: DialogB'
      },
      {
        type: 'custom',
        name: 'disable-dest',
        text: 'Disable other'
      },
      {
        type: 'custom',
        name: 'enable-dest',
        text: 'Enable other'
      }
    ],
    initialData: {

    },
    onSubmit: (api) => {
      store.adder('onSubmitA');
      api.close();
    },
    onClose: store.adder('onCloseA'),
    onChange: store.adder('onChangeA'),
    onAction: (dialogApi, actionData) => {
      if (actionData.name === 'Dest.DialogB') {
        dialogApi.redial(dialogB);
      } else if (actionData.name === 'disable-dest') {
        dialogApi.disable('Dest.DialogB');
      } else if (actionData.name === 'enable-dest') {
        dialogApi.enable('Dest.DialogB');
      }
    }
  };

  const dialogB: Types.Dialog.DialogApi<any> =  {
    title: 'DialogB',
    body: {
      type: 'panel',
      items: [ ]
    },
    buttons: [
      {
        type: 'custom',
        name: 'Dest.DialogC',
        text: 'Destination: DialogC'
      },
    ],
    initialData: { },
    onSubmit: (api) => {
      store.adder('onSubmitB');
      api.close();
    },
    onClose: store.adder('onCloseB'),
    onAction: (dialogApi, actionData) => {
      if (actionData.name === 'Dest.DialogC') {
        dialogApi.redial(dialogC);
      }
    }
  };

  const dialogC: Types.Dialog.DialogApi<any> =  {
    title: 'DialogC',
    body: {
      type: 'tabpanel',
      tabs: [
        {
          title: 'one',
          name: 'one',
          items: [
            {
              type: 'input',
              name: 'c.alpha'
            }
          ]
        },
        {
          title: 'two',
          name: 'two',
          items: [

          ]
        }
      ]
    },
    buttons: [
      {
        type: 'custom',
        name: 'tab.switch.two',
        text: 'Switch to Tab Two'
      }
    ],
    initialData: {
      'c.alpha': 'C.Alpha'
    },
    onSubmit: (api) => {
      store.adder('onSubmitC');
      api.close();
    },
    onClose: store.adder('onCloseC'),
    onAction: (dialogApi, actionData) => {
      if (actionData.name === 'tab.switch.two') {
        // tslint:disable-next-line:no-console
        console.log('going to tab');
        dialogApi.showTab('two');
      }
    }
  };

  const sTestOpen = Chain.asStep({ }, [
    Chain.injectThunked(() => {
      return windowManager.open(dialogA, {}, () => store.adder('closeWindow')() );
    }),
    Chain.op((dialogApi) => {
      currentDialogApi.set(dialogApi);
    })
  ]);

  const sTestClose = GeneralSteps.sequence([
    Mouse.sClickOn(Body.body(), '[aria-label="Close"]'),
    UiFinder.sNotExists(Body.body(), '[role="dialog"]')
  ]);

  Pipeline.async({}, [
    sTestOpen,
    UiFinder.sExists(Body.body(), 'button:contains("Destination: DialogB"):not([disabled])'),
    Mouse.sClickOn(Body.body(), 'button:contains("Disable other")'),
    Logger.t(
      'Button should be disabled',
      UiFinder.sNotExists(Body.body(), 'button:contains("Destination: DialogB"):not([disabled])')
    ),

    Mouse.sClickOn(Body.body(), 'button:contains("Disable other")'),
    Mouse.sClickOn(Body.body(), 'button:contains("Destination: DialogB")'),

    Mouse.sClickOn(Body.body(), 'button:contains("Enable other")'),
    Logger.t(
      'Button should be enabled',
      UiFinder.sExists(Body.body(), 'button:contains("Destination: DialogB"):not([disabled])')
    ),
    Mouse.sClickOn(Body.body(), 'button:contains("Destination: DialogB")'),

    Mouse.sClickOn(Body.body(), 'button:contains("Destination: DialogC")'),
    Chain.asStep(Body.body(), [
      UiFinder.cFindIn('input'),
      Chain.op((input) => {
        Assertions.assertEq('Checking input value', 'C.Alpha', Value.get(input));
      })
    ]),

    Step.sync(() => {
      currentDialogApi.get().disable('tab.switch.two');
    }),
    UiFinder.sExists(Body.body(), 'button[disabled]:contains("Switch to Tab Two")'),
    Step.sync(() => {
      currentDialogApi.get().enable('tab.switch.two');
    }),

    Mouse.sClickOn(Body.body(), 'button:contains("Switch to Tab Two")'),
    Logger.t(
      'Tab "Two" should be selected',
      UiFinder.sExists(Body.body(), '.tox-dialog__body-nav-item--active:contains("two")')
    ),

    sTestClose,
    Waiter.sTryUntil(
      'Waiting for all dialog events when closing',
      store.sAssertEq('Checking stuff', [
        'closeWindow',
        'onCloseC'
      ])
    )
  ], () => {
    helpers.destroy();
    success();
  }, failure);
});
