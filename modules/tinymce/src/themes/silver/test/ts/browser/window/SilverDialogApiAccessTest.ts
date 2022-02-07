import { Mouse, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as DialogUtils from '../../module/DialogUtils';

describe('browser.tinymce.themes.silver.window.SilverDialogApiAccessTest', () => {
  const store = TestHelpers.TestStore();
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

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
      setTimeout(() => {
        const currentData = api.getData();
        store.adder('currentData: ' + currentData.fieldA)();
        // Currently, this will be ignored once the dialog is closed.
        api.setData({
          fieldA: 'New Value'
        });

        // Check all APIs do not throw errors
        api.setEnabled('async.setData', false);
        api.setEnabled('async.setData', true);
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

  Arr.each([
    { label: 'Modal', params: { }},
    { label: 'Inline', params: { inline: 'toolbar' as 'toolbar' }}
  ], (test) => {
    context(test.label, () => {
      it('Open dialog, click a button, close the dialog and assert API data', async () => {
        const editor = hook.editor();
        store.clear();
        const api = DialogUtils.openWithStore(editor, dialogSpec, test.params, store);
        assert.deepEqual(api.getData(), {
          fieldA: 'Init Value'
        }, 'Initial data');
        Mouse.clickOn(SugarBody.body(), 'button:contains("Call")');
        DialogUtils.close(editor);
        await Waiter.pTryUntil('Wait until getData and setData calls fire asynchronously', () => store.assertEq('Checking stuff', [
          'onCancel',
          'onClose',
          'currentData: Init Value',
          'newData: Init Value'
        ]));
      });
    });
  });
});
