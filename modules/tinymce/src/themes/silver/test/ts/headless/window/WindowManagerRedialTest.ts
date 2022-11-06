import { Mouse, TestStore, UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { SugarBody, Value } from '@ephox/sugar';
import { assert } from 'chai';

import { Dialog } from 'tinymce/core/api/ui/Ui';
import { WindowManagerImpl } from 'tinymce/core/api/WindowManager';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import * as TestExtras from '../../module/TestExtras';

describe('headless.tinymce.themes.silver.window.WindowManagerRedialTest', () => {
  const store = TestStore();
  const extrasHook = TestExtras.bddSetup();
  let windowManager: WindowManagerImpl;
  before(() => {
    windowManager = WindowManager.setup(extrasHook.access().extras);
  });

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
        dialogApi.setEnabled('Dest.DialogB', false);
      } else if (actionData.name === 'enable-dest') {
        dialogApi.setEnabled('Dest.DialogB', true);
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
        dialogApi.redial(dialogC as Dialog.DialogSpec<{}>);
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

  const openDialog = () =>
    windowManager.open(dialogA, {}, () => store.adder('closeWindow')());

  const closeDialog = () => {
    Mouse.clickOn(SugarBody.body(), '[aria-label="Close"]');
    UiFinder.notExists(SugarBody.body(), '[role="dialog"]');
  };

  it('Check redialing a dialog', async () => {
    const dialogApi = openDialog();
    UiFinder.exists(SugarBody.body(), 'button:contains("Destination: DialogB"):not([disabled])');
    Mouse.clickOn(SugarBody.body(), 'button:contains("Disable other")');
    // Button should be disabled
    UiFinder.notExists(SugarBody.body(), 'button:contains("Destination: DialogB"):not([disabled])');

    Mouse.clickOn(SugarBody.body(), 'button:contains("Disable other")');
    Mouse.clickOn(SugarBody.body(), 'button:contains("Destination: DialogB")');

    Mouse.clickOn(SugarBody.body(), 'button:contains("Enable other")');
    // Button should be enabled
    UiFinder.exists(SugarBody.body(), 'button:contains("Destination: DialogB"):not([disabled])');
    Mouse.clickOn(SugarBody.body(), 'button:contains("Destination: DialogB")');

    Mouse.clickOn(SugarBody.body(), 'button:contains("Destination: DialogC")');
    const input = UiFinder.findIn<HTMLInputElement>(SugarBody.body(), 'input').getOrDie();
    assert.equal(Value.get(input), 'C.Alpha', 'Checking input value');

    dialogApi.setEnabled('tab.switch.two', false);
    UiFinder.exists(SugarBody.body(), 'button[disabled]:contains("Switch to Tab Two")');
    dialogApi.setEnabled('tab.switch.two', true);

    Mouse.clickOn(SugarBody.body(), 'button:contains("Switch to Tab Two")');
    // Tab "Two" should be selected
    UiFinder.exists(SugarBody.body(), '.tox-dialog__body-nav-item--active:contains("two")');

    closeDialog();
    await Waiter.pTryUntil(
      'Waiting for all dialog events when closing',
      () => store.assertEq('Checking stuff', [
        'closeWindow',
        'onCloseC'
      ])
    );
  });
});
