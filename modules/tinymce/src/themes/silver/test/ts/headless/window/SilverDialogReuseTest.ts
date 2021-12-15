import { FocusTools } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { before, describe, it } from '@ephox/bedrock-client';
import { Dialog as BridgeSpec } from '@ephox/bridge';
import { SugarDocument } from '@ephox/sugar';
import { assert } from 'chai';

import { Dialog } from 'tinymce/core/api/ui/Ui';
import { WindowManagerImpl } from 'tinymce/core/api/WindowManager';
import * as WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import * as TestExtras from '../../module/TestExtras';

describe('headless.tinymce.themes.silver.window.SilverDialogReuseTest', () => {
  const store = TestHelpers.TestStore();
  const helpers = TestExtras.bddSetup();
  let windowManager: WindowManagerImpl;
  let dialogApi: Dialog.DialogInstanceApi<any>;
  before(() => {
    windowManager = WindowManager.setup(helpers.extras());
  });

  const baseDialogActions = {
    onSubmit: store.adder('onSubmit'),
    onClose: store.adder('onClose'),
    onChange: store.adder('onChange'),
    onAction: store.adder('onAction')
  };

  const baseDialogButtons: BridgeSpec.DialogFooterButtonSpec[] = [
    {
      type: 'custom',
      name: 'barny',
      text: 'Barny Text',
      align: 'start',
      primary: true
    }
  ];

  const openDialogAndAssertInitialData = () => {
    dialogApi = windowManager.open({
      title: 'Silver Test Modal Dialog',
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            name: 'fred',
            label: 'Freds Input'
          }
        ]
      },
      buttons: baseDialogButtons,
      ...baseDialogActions,
      initialData: {
        fred: 'said hello pebbles'
      }
    }, {}, () => store.adder('closeWindow')());

    assert.deepEqual(dialogApi.getData(), {
      fred: 'said hello pebbles'
    }, 'Initial data');
  };

  const openNestedDialogAndAssertInitialData = () => {
    dialogApi = windowManager.open({
      title: 'Silver Test Modal Dialog',
      body: {
        type: 'panel',
        items: [
          {
            type: 'bar',
            items: [
              {
                name: 'hello',
                type: 'button',
                text: 'Hello!'
              }
            ]
          },
          {
            type: 'checkbox',
            name: 'check',
            label: 'Check!'
          }
        ]
      },
      buttons: baseDialogButtons,
      ...baseDialogActions,
      initialData: {
        check: true
      }
    }, {}, () => store.adder('closeWindow')());
    dialogApi.focus('check');

    assert.deepEqual(dialogApi.getData(), {
      check: true,
      hello: ''
    }, 'Initial data');
  };

  it('TINY-8334: Open a dialog, assert initial focus, redial with similar data, check focus maintained', async () => {
    openDialogAndAssertInitialData();
    const beforeInput = await FocusTools.pTryOnSelector('Focus should start on the input', SugarDocument.getDocument(), 'input');

    // Tag the element
    (beforeInput.dom as any).GOOSE = 'goose';

    dialogApi.redial({
      title: 'Silver Test Modal Dialog',
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            name: 'fred',
            label: 'Freds Input'
          },
          {
            type: 'input',
            name: 'wilma',
            label: 'Wilmas input'
          }
        ]
      },
      buttons: baseDialogButtons,
      ...baseDialogActions,
      initialData: {
        fred: 'said hello pebbles',
        wilma: 'new things'
      }
    });

    const afterInput = await FocusTools.pTryOnSelector('Focus should stay on the input after redial', SugarDocument.getDocument(), 'input');
    assert.equal((afterInput.dom as any).GOOSE, 'goose', 'The fred input should not have been recreated');

    assert.deepEqual(dialogApi.getData(), {
      fred: 'said hello pebbles',
      wilma: 'new things'
    }, 'Initial data');
  });

  it('TINY-8334: Open a dialog with nested spec, redial with different child spec, check top level items are not re-rendered', async () => {
    openNestedDialogAndAssertInitialData();
    const beforeCheckbox = await FocusTools.pTryOnSelector('Focus should start on the checkbox', SugarDocument.getDocument(), 'input');

    // Tag the element
    (beforeCheckbox.dom as any).GOOSE = 'goose';

    dialogApi.redial({
      title: 'Silver Test Modal Dialog',
      body: {
        type: 'panel',
        items: [
          {
            type: 'bar',
            items: [
              {
                name: 'helloworld',
                type: 'button',
                text: 'Hello World!'
              }
            ]
          },
          {
            type: 'checkbox',
            name: 'check',
            label: 'Check!'
          }
        ]
      },
      buttons: baseDialogButtons,
      ...baseDialogActions,
      initialData: {
        check: false
      }
    });

    const afterCheckbox = await FocusTools.pTryOnSelector('Focus should stay on the checkbox', SugarDocument.getDocument(), 'input');
    assert.equal((afterCheckbox.dom as any).GOOSE, 'goose', 'The check input should not have been recreated');

    assert.deepEqual(dialogApi.getData(), {
      check: false,
      helloworld: ''
    }, 'Initial data');
  });
});
