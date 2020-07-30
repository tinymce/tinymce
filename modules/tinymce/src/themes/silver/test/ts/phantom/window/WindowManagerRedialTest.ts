import { Assertions, Chain, GeneralSteps, Logger, Mouse, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { SugarBody, Value } from '@ephox/sugar';

import { Dialog } from 'tinymce/core/api/ui/Ui';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';
import TestExtras from '../../module/TestExtras';

UnitTest.asynctest('WindowManager:redial Test', (success, failure) => {
  const helpers = TestExtras();
  const windowManager = WindowManager.setup(helpers.extras);

  const currentDialogApi = Cell<Dialog.DialogInstanceApi<any>>({ } as any);

  const store = TestHelpers.TestStore();

  const dialogA: Dialog.DialogSpec<{}> = {
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

  const dialogB: Dialog.DialogSpec<{}> = {
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
      }
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

  const dialogC: Dialog.DialogSpec<{ 'c.alpha': string }> = {
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
        // eslint-disable-next-line no-console
        console.log('going to tab');
        dialogApi.showTab('two');
      }
    }
  };

  const sTestOpen = Chain.asStep({ }, [
    Chain.injectThunked(() => windowManager.open(dialogA, {}, () => store.adder('closeWindow')() )),
    Chain.op((dialogApi) => {
      currentDialogApi.set(dialogApi);
    })
  ]);

  const sTestClose = GeneralSteps.sequence([
    Mouse.sClickOn(SugarBody.body(), '[aria-label="Close"]'),
    UiFinder.sNotExists(SugarBody.body(), '[role="dialog"]')
  ]);

  Pipeline.async({}, [
    sTestOpen,
    UiFinder.sExists(SugarBody.body(), 'button:contains("Destination: DialogB"):not([disabled])'),
    Mouse.sClickOn(SugarBody.body(), 'button:contains("Disable other")'),
    Logger.t(
      'Button should be disabled',
      UiFinder.sNotExists(SugarBody.body(), 'button:contains("Destination: DialogB"):not([disabled])')
    ),

    Mouse.sClickOn(SugarBody.body(), 'button:contains("Disable other")'),
    Mouse.sClickOn(SugarBody.body(), 'button:contains("Destination: DialogB")'),

    Mouse.sClickOn(SugarBody.body(), 'button:contains("Enable other")'),
    Logger.t(
      'Button should be enabled',
      UiFinder.sExists(SugarBody.body(), 'button:contains("Destination: DialogB"):not([disabled])')
    ),
    Mouse.sClickOn(SugarBody.body(), 'button:contains("Destination: DialogB")'),

    Mouse.sClickOn(SugarBody.body(), 'button:contains("Destination: DialogC")'),
    Chain.asStep(SugarBody.body(), [
      UiFinder.cFindIn('input'),
      Chain.op((input) => {
        Assertions.assertEq('Checking input value', 'C.Alpha', Value.get(input));
      })
    ]),

    Step.sync(() => {
      currentDialogApi.get().disable('tab.switch.two');
    }),
    UiFinder.sExists(SugarBody.body(), 'button[disabled]:contains("Switch to Tab Two")'),
    Step.sync(() => {
      currentDialogApi.get().enable('tab.switch.two');
    }),

    Mouse.sClickOn(SugarBody.body(), 'button:contains("Switch to Tab Two")'),
    Logger.t(
      'Tab "Two" should be selected',
      UiFinder.sExists(SugarBody.body(), '.tox-dialog__body-nav-item--active:contains("two")')
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
