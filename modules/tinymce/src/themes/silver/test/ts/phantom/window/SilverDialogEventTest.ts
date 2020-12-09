import { Logger, Mouse, Pipeline, Step, UiFinder, Waiter } from '@ephox/agar';
import { Behaviour, GuiFactory, ModalDialog, Positioning, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { ValueSchema } from '@ephox/boulder';
import { DialogManager } from '@ephox/bridge';
import { Fun, Optional, Result } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';

import I18n from 'tinymce/core/api/util/I18n';
import { renderDialog } from 'tinymce/themes/silver/ui/window/SilverDialog';
import { WindowExtra } from 'tinymce/themes/silver/ui/window/SilverDialogCommon';

UnitTest.asynctest('SilverDialog Event Test', (success, failure) => {

  const dialogSpec = (store): DialogManager.DialogInit<{}> =>
    // the `any` here can't be removed, because internalDialog uses types that aren't exposed from Bridge
    ({
      internalDialog: {
        title: 'test dialog',
        size: 'normal',
        body: {
          type: 'panel',
          items: [],
          classes: []
        },
        buttons: [
          {
            type: 'cancel',
            name: 'cancel',
            text: 'Cancel',
            align: 'end',
            primary: false,
            disabled: false,
            icon: Optional.none()
          },
          {
            type: 'submit',
            name: 'save',
            text: 'Save',
            align: 'end',
            primary: true,
            disabled: false,
            icon: Optional.none()
          }
        ],
        initialData: {},
        onChange: Fun.noop,
        onAction: Fun.noop,
        onTabChange: Fun.noop,
        onSubmit: (api) => {
          store.adder('onSubmit')();
          api.close();
        },
        onClose: store.adder('onClose'),
        onCancel: store.adder('onCancel')
      },
      initialData: {},
      dataValidator: ValueSchema.anyValue()
    });

  const sGui = (selector: string, sequence) => Step.async((next, die) => {
    TestHelpers.GuiSetup.setup(
      (_store, _dov, _body) =>
        // Build the sink for the component
        GuiFactory.build({
          dom: {
            tag: 'div'
          },
          behaviours: Behaviour.derive([
            Positioning.config({ })
          ])
        }),
      (_doc, _body, _gui, sink, store) => {
        const dialogStuff = renderDialog(
          // Build the component
          dialogSpec(store),
          {
            redial: () => dialogSpec(store),
            closeWindow: () => store.adder('closeWindow')
          } as WindowExtra,
          {
            shared: {
              getSink: () => Result.value(sink),
              providers: {
                icons: () => <Record<string, string>> {},
                menuItems: () => <Record<string, any>> {},
                translate: I18n.translate,
                isDisabled: Fun.never,
                getSetting: (_settingName: string, defaultVal: any) => defaultVal
              }
            },
            dialog: {
              isDraggableModal: Fun.never
            }
          }
        );

        const dialog = dialogStuff.dialog;

        // Assert things
        return [
          Step.sync(() => {
            ModalDialog.show(dialog);
          }),
          Waiter.sTryUntil(
            'Waiting for blocker to disappear after clicking close',
            UiFinder.sExists(SugarBody.body(), '.tox-dialog-wrap')
          ),
          Mouse.sClickOn(sink.element, selector),
          store.sAssertEq('Check event sequence', sequence),
          store.sClear
        ];
      },
      next, die
    );
  });

  Pipeline.async({}, Logger.ts('Test events for Submit, Cancel and X buttons', [
    sGui('button.tox-button:contains(Save)', [ 'onSubmit', 'onClose' ]),
    sGui('button.tox-button:contains(Cancel)', [ 'onCancel', 'onClose' ]),
    sGui('[aria-label="Close"]', [ 'onCancel', 'onClose' ])
  ]), success, failure);

});
