import { Assertions, Chain, GeneralSteps, Logger, Mouse, Pipeline, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { TinyLoader } from '@ephox/mcagar';
import { SugarBody } from '@ephox/sugar';

import { Dialog } from 'tinymce/core/api/ui/Ui';
import Delay from 'tinymce/core/api/util/Delay';
import Theme from 'tinymce/themes/silver/Theme';
import * as DialogUtils from '../../module/DialogUtils';

UnitTest.asynctest('WindowManager:simple-dialog access Test', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const currentApi = Cell<Dialog.DialogInstanceApi<any>>({ } as any);
    const store = TestHelpers.TestStore();

    const dialogSpec: Dialog.DialogSpec<{ fieldA: string }> = {
      title: 'Silver Test Access Dialog',
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            name: 'fieldA',
            label: 'Label'
          }
        ]
      },
      buttons: [
        {
          type: 'custom',
          name: 'async.setData',
          text: 'Call api.setData after two seconds',
          align: 'start',
          primary: true
        }
      ],
      initialData: {
        fieldA: 'Init Value'
      },
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
          const redialSpec: Dialog.DialogSpec<{ fieldA: string }> = {
            title: 'temporary redial to check the API',
            body: {
              type: 'panel',
              items: []
            },
            buttons: []
          };
          api.redial(redialSpec);
          api.close();

          store.adder('newData: ' + currentData.fieldA)();
        }, 180);
      }
    };

    const sTestOpen = (params) => Chain.asStep({ }, [
      DialogUtils.cOpenWithStore(editor, dialogSpec, params, store),
      Chain.op((dialogApi) => {
        Assertions.assertEq('Initial data', {
          fieldA: 'Init Value'
        }, dialogApi.getData());

        currentApi.set(dialogApi);
      })
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
          Mouse.sClickOn(SugarBody.body(), 'button:contains("Call")')
        ),

        Logger.t(
          'Click on the close button, so that dialog is shut down',
          DialogUtils.sClose
        ),

        Waiter.sTryUntil(
          'Wait until getData and setData calls fire asynchronously',
          store.sAssertEq('Checking stuff', [
            'onCancel',
            'onClose',
            'currentData: Init Value',
            'newData: Init Value'
          ])
        )
      ])
    );

    Pipeline.async({}, [
      testDialog('Modal', { }),
      testDialog('Inline', { inline: 'toolbar' })
    ], onSuccess, onFailure);
  },
  {
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
