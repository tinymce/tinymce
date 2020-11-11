import { ApproxStructure, Assertions, Chain, FocusTools, GeneralSteps, Logger, Mouse, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Cell, Strings } from '@ephox/katamari';
import { TinyLoader } from '@ephox/mcagar';
import { SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import { WindowParams } from 'tinymce/core/api/WindowManager';
import Theme from 'tinymce/themes/silver/Theme';
import * as DialogUtils from '../../module/DialogUtils';

UnitTest.asynctest('WindowManager:inline-dialog Test', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor: Editor, onSuccess, onFailure) => {
    const store = TestHelpers.TestStore();
    const currentApi = Cell<Dialog.DialogInstanceApi<any>>({ } as any);

    const dialogSpec: Dialog.DialogSpec<{ fred: string }> = {
      title: 'Silver Test Inline (Toolbar) Dialog',
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
      buttons: [
        {
          type: 'custom',
          name: 'barny',
          text: 'Barny Text',
          align: 'start',
          primary: true
        },
        {
          type: 'custom',
          name: 'alert',
          text: 'Alert'
        },
        {
          type: 'custom',
          name: 'confirm',
          text: 'Confirm'
        }
      ],
      initialData: {
        fred: 'said hello pebbles'
      },
      onAction: (api, action) => {
        store.adder('onAction')();
        switch (action.name) {
          case 'alert':
            editor.windowManager.alert('Alert!');
            break;
          case 'confirm':
            editor.windowManager.confirm('Alert!');
            break;
        }
      }
    };

    const sTestOpen = (params: WindowParams) => Chain.asStep({ }, [
      DialogUtils.cOpenWithStore(editor, dialogSpec, params, store),
      Chain.op((dialogApi) => {
        Assertions.assertEq('Initial data', {
          fred: 'said hello pebbles'
        }, dialogApi.getData());

        currentApi.set(dialogApi);
      })
    ]);

    const sTestAlertOrConfirm = (type: 'alert' | 'confirm') => {
      const buttonSelector = Strings.capitalize(type);
      const dialogSelector = `.tox-${type}-dialog`;
      return GeneralSteps.sequence([
        store.sClear,
        Mouse.sTrueClickOn(SugarBody.body(), '[role=dialog] button:contains(' + buttonSelector + ')'),
        DialogUtils.sWaitForOpen(dialogSelector),
        store.sAssertEq('Checking onAction called', [ 'onAction' ]),
        Mouse.sTrueClickOn(SugarBody.body(), dialogSelector + ' .tox-dialog__footer button'),
        Waiter.sTryUntil('Wait for dialog to close', UiFinder.sNotExists(SugarBody.body(), dialogSelector))
      ]);
    };

    Pipeline.async({}, [
      TestHelpers.GuiSetup.mAddStyles(SugarElement.fromDom(document), [
        '.tox-dialog { background: white; border: 2px solid black; padding: 1em; margin: 1em; }'
      ]),
      sTestOpen({}),
      FocusTools.sTryOnSelector(
        'Focus should start on the input',
        SugarElement.fromDom(document),
        'input'
      ),
      Step.sync(() => {
        currentApi.get().disable('barny');
      }),
      DialogUtils.sClose,
      Waiter.sTryUntil(
        'Waiting for all dialog events when closing',
        store.sAssertEq('Checking stuff', [
          'onCancel',
          'onClose'
        ])
      ),

      store.sClear,

      sTestOpen({ inline: 'toolbar' }),
      FocusTools.sTryOnSelector(
        'Focus should start on the input',
        SugarElement.fromDom(document),
        'input'
      ),
      Assertions.sAssertStructure('"tox-dialog__scroll-disable" should not have been added to the body',
        ApproxStructure.build((s, str, arr) => s.element('body', {
          classes: [ arr.not('tox-dialog__disable-scroll') ]
        })),
        SugarBody.body()
      ),

      // Ensure the dialog isn't dismissed when clicking on alert or confirm dialogs
      sTestAlertOrConfirm('alert'),
      sTestAlertOrConfirm('confirm'),
      store.sClear,

      // Clicking elsewhere should close the dialog
      Mouse.sTrueClickOn(SugarBody.body(), 'root:body'),
      Waiter.sTryUntil(
        'Waiting for all dialog events when closing via dismiss',
        store.sAssertEq('Checking stuff', [
          'onCancel',
          'onClose'
        ])
      ),
      Logger.t(
        'After broadcasting dismiss, dialog should be removed',
        UiFinder.sNotExists(SugarBody.body(), '[role="dialog"]')
      ),
      TestHelpers.GuiSetup.mRemoveStyles
    ], onSuccess, onFailure);
  },
  {
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
