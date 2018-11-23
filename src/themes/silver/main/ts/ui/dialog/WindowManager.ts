import {
  AddEventsBehaviour,
  AlloyEvents,
  AlloyTriggers,
  Behaviour,
  GuiFactory,
  InlineView,
  Keying,
  ModalDialog,
  SystemEvents,
} from '@ephox/alloy';
import { Processor, ValueSchema } from '@ephox/boulder';
import { DialogManager, Types } from '@ephox/bridge';

import { formCancelEvent } from '../general/FormEvents';
import { renderDialog } from '../window/SilverDialog';
import { renderInlineDialog } from '../window/SilverInlineDialog';
import * as AlertDialog from './AlertDialog';
import * as ConfirmDialog from './ConfirmDialog';
import { UiFactoryBackstage } from '../../backstage/Backstage';

export interface WindowManagerSetup {
  backstage: UiFactoryBackstage;
}

const validateData = (data: Record<string, string>, validator: Processor) => {
  return ValueSchema.getOrDie(ValueSchema.asRaw('data', validator, data));
};

const setup = (extras: WindowManagerSetup) => {
  const alertDialog = AlertDialog.setup(extras);
  const confirmDialog = ConfirmDialog.setup(extras);

  // Some plugins break with this API type specified. Investigate.
  const open = (config/*: Types.Dialog.DialogApi<T>*/, params) => {
    if (params !== undefined && params.inline === 'toolbar') {
      return openInlineDialog(config, extras.backstage.shared.anchors.toolbar());
    } else if (params !== undefined && params.inline === 'cursor') {
      return openInlineDialog(config, extras.backstage.shared.anchors.cursor());
    } else {
      return openModalDialog(config);
    }
  };

  const openModalDialog = (config) => {
    const factory = <T extends Record<string, any>>(contents: Types.Dialog.Dialog<T>, internalInitialData, dataValidator: Processor): Types.Dialog.DialogInstanceApi<T> => {
      // We used to validate data here, but it's done by the instanceApi.setData call below.
      const initialData = internalInitialData;

      const dialogInit = {
        dataValidator,
        initialData,
        internalDialog: contents
      };

      const dialog = renderDialog<T>(
        dialogInit,
        {
          redial: DialogManager.DialogManager.redial,
          closeWindow: () => {
            ModalDialog.hide(dialog.dialog);
          }
        },
        extras.backstage
      );

      ModalDialog.show(dialog.dialog);
      dialog.instanceApi.setData(initialData);
      return dialog.instanceApi;
    };

    return DialogManager.DialogManager.open(factory, config);
  };

  const openInlineDialog = (config/*: Types.Dialog.DialogApi<T>*/, anchor) => {
    const factory = <T extends Record<string, any>>(contents: Types.Dialog.Dialog<T>, internalInitialData: Record<string, string>, dataValidator: Processor): Types.Dialog.DialogInstanceApi<T> => {
      const initialData = validateData(internalInitialData, dataValidator);

      const dialogInit = {
        dataValidator,
        initialData,
        internalDialog: contents
      };

      const dialogUi = renderInlineDialog<T>(
        dialogInit,
        {
          redial: DialogManager.DialogManager.redial,
          closeWindow: () => {
            InlineView.hide(inlineDialog);
          }
        },
        extras.backstage
      );

      const inlineDialog = GuiFactory.build(InlineView.sketch({
        lazySink: extras.backstage.shared.getSink,
        dom: {
          tag: 'div',
          classes: [ ]
        },
        // Fires the default dismiss event.
        fireDismissalEventInstead: { },
        inlineBehaviours: Behaviour.derive([
          AddEventsBehaviour.config('window-manager-inline-events', [
            // Can't just fireDimissalEvent formCloseEvent, because it is on the parent component of the dialog
            AlloyEvents.run(SystemEvents.dismissRequested(), (comp, se) => {
              AlloyTriggers.emit(dialogUi.dialog, formCancelEvent);
            })
          ])
        ])
      }));
      InlineView.showAt(
        inlineDialog,
        anchor,
        GuiFactory.premade(dialogUi.dialog)
      );
      dialogUi.instanceApi.setData(initialData);
      Keying.focusIn(dialogUi.dialog);
      return dialogUi.instanceApi;
    };

    return DialogManager.DialogManager.open(factory, config);
  };

  const confirm = (message: string, callback: (flag) => void) => {
    confirmDialog.open(message, (state) => {
      callback(state);
    });
  };

  const alert = (message: string, callback: () => void) => {
    alertDialog.open(message, () => {
      callback();
    });
  };

  const close = (instanceApi: Types.Dialog.DialogInstanceApi<any>) => {
    instanceApi.close();
  };

  return {
    open,
    alert,
    close,
    confirm
  };
};

export default {
  setup
};