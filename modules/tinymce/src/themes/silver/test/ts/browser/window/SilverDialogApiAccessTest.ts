import { Keys, Mouse, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as DialogUtils from '../../module/DialogUtils';

describe('browser.tinymce.themes.silver.window.SilverDialogApiAccessTest', () => {
  const store = TestStore();
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
      },
      {
        type: 'custom',
        name: 'fullscreen',
        text: 'Toggle fullscreen'
      }
    ],
    initialData: {
      fieldA: 'Init Value'
    },
    onAction: (api, actionData) => {
      if (actionData.name === 'async.setData') {
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
      if (actionData.name === 'fullscreen') {
        api.toggleFullscreen();
      }
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

      it('TINY-9528: fullscreen toggle should apply the correct class', () => {
        const editor = hook.editor();
        DialogUtils.open(editor, dialogSpec, test.params);

        const dialog = UiFinder.findIn(TinyDom.fromDom(document), '.tox-dialog').getOrDie();
        const dialogHasClass = (className: string) => dialog.dom.classList.contains(className);

        assert.isFalse(dialogHasClass('tox-dialog--fullscreen'), 'before toggle dialog should not have class tox-dialog--fullscreen');

        TinyUiActions.clickOnUi(editor, 'button:contains("Toggle fullscreen")');

        assert.isTrue(dialogHasClass('tox-dialog--fullscreen'), 'after toggle dialog should have class tox-dialog--fullscreen');

        TinyUiActions.clickOnUi(editor, 'button:contains("Toggle fullscreen")');

        assert.isFalse(dialogHasClass('tox-dialog--fullscreen'), 'after a second toggle dialog should not have class tox-dialog--fullscreen');

        DialogUtils.close(editor);
      });

      it('TINY-9686: opening menu button in footer should not throw error after a redial', async () => {
        const editor = hook.editor();

        const pTestMenuButtonItem = async (expectedState: boolean) => {
          Mouse.clickOn(SugarBody.body(), 'button:contains("Menu button")');
          await UiFinder.pWaitFor('Waited for menu item to appear', SugarBody.body(), `[role="menuitemcheckbox"][aria-checked="${expectedState}"]:contains("Item 1")`);
          TinyUiActions.keystroke(editor, Keys.escape());
        };

        const getDialogSpec = (itemState: boolean): Dialog.DialogSpec<{ fieldA: string; item1: boolean }> => ({
          title: 'Dialog',
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
              type: 'menu',
              text: 'Menu button',
              items: [
                { type: 'togglemenuitem', name: 'item1', text: 'Item 1' }
              ]
            }
          ],
          initialData: {
            fieldA: 'Init Value',
            item1: itemState
          }
        });

        const win = DialogUtils.open(editor, getDialogSpec(true), test.params);

        await pTestMenuButtonItem(true);
        win.redial(getDialogSpec(false));
        await pTestMenuButtonItem(false);
        win.redial(getDialogSpec(true));
        await pTestMenuButtonItem(true);

        DialogUtils.close(editor);
      });
    });
  });
});
