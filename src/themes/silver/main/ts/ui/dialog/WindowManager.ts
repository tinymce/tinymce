/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

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
  const open = (config/*: Types.Dialog.DialogApi<T>*/, params, closeWindow: (dialogApi: Types.Dialog.DialogInstanceApi<any>) => void) => {
    if (params !== undefined && params.inline === 'toolbar') {
      return openInlineDialog(config, extras.backstage.shared.anchors.toolbar(), closeWindow);
    } else if (params !== undefined && params.inline === 'cursor') {
      return openInlineDialog(config, extras.backstage.shared.anchors.cursor(), closeWindow);
    } else {
      return openModalDialog(config, closeWindow);
    }
  };

  const openModalDialog = (config/*: Types.Dialog.DialogApi<T>*/, closeWindow) => {
    const factory = <T extends Record<string, any>>(contents: Types.Dialog.Dialog<T>, internalInitialData, dataValidator: Processor): Types.Dialog.DialogInstanceApi<T> => {
      // We used to validate data here, but it's done by the instanceApi.setData call below.
      const initialData = internalInitialData;

      const dialogInit: DialogManager.DialogInit<T> = {
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
            closeWindow(dialog.instanceApi);
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

  const openInlineDialog = (config/*: Types.Dialog.DialogApi<T>*/, anchor, closeWindow: (dialogApi: Types.Dialog.DialogInstanceApi<any>) => void) => {
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
            closeWindow(dialogUi.instanceApi);
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

  const confirm = (message: string, callback: (state: boolean) => void) => {
    confirmDialog.open(message, (state) => {
      callback(state);
    });
  };

  const alert = (message: string, callback: () => void) => {
    alertDialog.open(message, () => {
      callback();
    });
  };

  const close = (instanceApi) => {
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