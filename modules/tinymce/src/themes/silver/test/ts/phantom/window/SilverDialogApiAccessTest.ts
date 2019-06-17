import { Assertions, Chain, GeneralSteps, Logger, Mouse, Pipeline, UiFinder, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Types } from '@ephox/bridge';
import { Cell } from '@ephox/katamari';
import { Body } from '@ephox/sugar';
import Delay from 'tinymce/core/api/util/Delay';
import WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import TestExtras from '../../module/TestExtras';

UnitTest.asynctest('WindowManager:simple-dialog access Test', (success, failure) => {
  const helpers = TestExtras();
  const windowManager = WindowManager.setup(helpers.extras);

  const currentApi = Cell<Types.Dialog.DialogInstanceApi<any>>({ } as any);

  const store = TestHelpers.TestStore();

  const sTestOpen = (params) => Chain.asStep({ }, [
    Chain.mapper((_) => {
      return windowManager.open({
        title: 'Silver Test Access Dialog',
        body: {
          type: 'panel',
          items: [
            {
              type: 'input',
              name: 'fieldA',
              label: 'Label'
            },
          ]
        },
        buttons: [
          {
            type: 'custom',
            name: 'async.setData',
            text: 'Call api.setData after two seconds',
            align: 'start',
            primary: true
          },
        ],
        initialData: {
          fieldA: 'Init Value'
        },
        onSubmit: store.adder('onSubmit'),
        onClose: store.adder('onClose'),
        onCancel: store.adder('onCancel'),
        onChange: store.adder('onChange'),
        onAction: (api, _actionData) => {
          Delay.setTimeout(() => {
            const currentData = api.getData();
            store.adder('currentData: ' + currentData.fieldA)();
            // Currently, this will be ignored once the dialog is closed.
            api.setData({
              fieldA: 'New Value'
            });

            // Check all APIs do not throw errors
            api.disable('async.setData');
            api.enable('async.setData');
            api.block('message');
            api.unblock();
            api.showTab('new tab');
            // Currently, it is only going to validate it if the dialog is still open
            api.redial({
              title: 'temporary redial to check the API',
              body: {
                type: 'panel',
                items: []
              },
              buttons: []
            });
            api.close();

            store.adder('newData: ' + currentData.fieldA)();
          }, 2000);
        }
      }, params, () => store.adder('closeWindow')());
    }),

    Chain.op((dialogApi) => {
      Assertions.assertEq('Initial data', {
        fieldA: 'Init Value'
      }, dialogApi.getData());

      currentApi.set(dialogApi);
    })
  ]);

  const sTestClose = GeneralSteps.sequence([
    Mouse.sClickOn(Body.body(), '[aria-label="Close"]'),
    UiFinder.sNotExists(Body.body(), '[role="dialog"]')
  ]);

  const testDialog = (label: string, params: { inline?: string }) => Logger.t(
    `Testing ${label}`,
    GeneralSteps.sequence([
      store.sClear,
      Logger.t(
        'Open a dialog, with a change button that accesses API asynchronously',
        sTestOpen(params)
      ),

      Logger.t(
        'Trigger the async functions by clicking on the button',
        Mouse.sClickOn(Body.body(), 'button:contains("Call")')
      ),

      Logger.t(
        'Click on the close button, so that dialog is shut down',
        sTestClose
      ),

      Waiter.sTryUntil(
        'Wait until getData and setData calls fire asynchronously',
        store.sAssertEq('Checking stuff', [
          'onCancel',
          'closeWindow',
          'onClose',
          'currentData: Init Value',
          'newData: Init Value'
        ]),
        100,
        5000
      )
    ])
  );

  Pipeline.async({}, [
    testDialog('Modal', { }),
    testDialog('Inline', { inline: 'toolbar' })
  ], () => {
    helpers.destroy();
    success();
  }, failure);
});