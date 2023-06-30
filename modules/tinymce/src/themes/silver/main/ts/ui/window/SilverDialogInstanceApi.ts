import { AlloyComponent, AlloyTriggers, Composing, Disabling, Focusing, Form, Reflecting, Representing, TabSection } from '@ephox/alloy';
import { StructureSchema } from '@ephox/boulder';
import { Dialog, DialogManager } from '@ephox/bridge';
import { Cell, Merger, Obj, Optional, Type } from '@ephox/katamari';

import { formBlockEvent, formCloseEvent, formUnblockEvent } from '../general/FormEvents';
import { bodyChannel, dialogChannel, footerChannel, titleChannel } from './DialogChannels';
import * as SilverDialogCommon from './SilverDialogCommon';
import { FooterState } from './SilverDialogFooter';

const getCompByName = (access: DialogAccess, name: string): Optional<AlloyComponent> => {
  // TODO: Add API to alloy to find the inner most component of a Composing chain.
  const root = access.getRoot();
  // This is just to avoid throwing errors if the dialog closes before this. We should take it out
  // while developing (probably), and put it back in for the real thing.
  if (root.getSystem().isConnected()) {
    const form = Composing.getCurrent(access.getFormWrapper()).getOr(access.getFormWrapper());
    return Form.getField(form, name).orThunk(() => {
      const footer = access.getFooter();
      const footerState: Optional<FooterState> = footer.bind((f) => Reflecting.getState(f).get());
      return footerState.bind((f) => f.lookupByName(name));
    });
  } else {
    return Optional.none();
  }
};

const validateData = <T extends Dialog.DialogData>(access: DialogAccess, data: T) => {
  const root = access.getRoot();
  return Reflecting.getState(root).get().map((dialogState: DialogManager.DialogInit<T>) => StructureSchema.getOrDie(
    StructureSchema.asRaw('data', dialogState.dataValidator, data)
  )).getOr(data);
};

export interface DialogAccess {
  getId: () => string;
  getRoot: () => AlloyComponent;
  getBody: () => AlloyComponent;
  getFooter: () => Optional<AlloyComponent>;
  getFormWrapper: () => AlloyComponent;
  toggleFullscreen: () => void;
}

const getDialogApi = <T extends Dialog.DialogData>(
  access: DialogAccess,
  doRedial: (newConfig: Dialog.DialogSpec<T>) => DialogManager.DialogInit<T>,
  menuItemStates: Record<string, Cell<boolean>>
): Dialog.DialogInstanceApi<T> => {
  const withRoot = (f: (r: AlloyComponent) => void): void => {
    const root = access.getRoot();
    if (root.getSystem().isConnected()) {
      f(root);
    }
  };

  const getData = (): T => {
    const root = access.getRoot();
    const valueComp = root.getSystem().isConnected() ? access.getFormWrapper() : root;
    const representedValues = Representing.getValue(valueComp);
    const menuItemCurrentState = Obj.map(menuItemStates, (cell) => cell.get());
    return {
      ...representedValues,
      ...menuItemCurrentState
    };
  };

  const setData = (newData: Partial<T>) => {
    // Currently, the decision is to ignore setData calls that fire after the dialog is closed
    withRoot((_) => {
      const prevData = instanceApi.getData();
      const mergedData = Merger.deepMerge(prevData, newData);
      const newInternalData = validateData(access, mergedData);
      const form = access.getFormWrapper();
      Representing.setValue(form, newInternalData);
      Obj.each(menuItemStates, (v, k) => {
        if (Obj.has(mergedData, k)) {
          v.set(mergedData[k]);
        }
      });
    });
  };

  const setEnabled = (name: string, state: boolean) => {
    getCompByName(access, name).each(state ? Disabling.enable : Disabling.disable);
  };

  const focus = (name: string) => {
    getCompByName(access, name).each(Focusing.focus);
  };

  const block = (message: string) => {
    if (!Type.isString(message)) {
      throw new Error('The dialogInstanceAPI.block function should be passed a blocking message of type string as an argument');
    }
    withRoot((root) => {
      AlloyTriggers.emitWith(root, formBlockEvent, { message });
    });
  };

  const unblock = () => {
    withRoot((root) => {
      AlloyTriggers.emit(root, formUnblockEvent);
    });
  };

  const showTab = (name: string) => {
    withRoot((_) => {
      const body = access.getBody();
      const bodyState = Reflecting.getState(body);
      if (bodyState.get().exists((b) => b.isTabPanel())) {
        Composing.getCurrent(body).each((tabSection) => {
          TabSection.showTab(tabSection, name);
        });
      }
    });
  };

  const redial = (d: Dialog.DialogSpec<T>): void => {
    withRoot((root) => {
      const id = access.getId();
      const dialogInit = doRedial(d);
      const storedMenuButtons = SilverDialogCommon.mapMenuButtons(dialogInit.internalDialog.buttons, menuItemStates);
      // TINY-9223: We only need to broadcast to the mothership containing the dialog
      root.getSystem().broadcastOn([ `${dialogChannel}-${id}` ], dialogInit);

      // NOTE: Reflecting does not have any smart handling of nested reflecting components,
      // and the order of receiving a broadcast is non-deterministic. Here we use separate
      // channels for each section (title, body, footer), and make those broadcasts *after*
      // we've already sent the overall dialog broadcast. The overall dialog broadcast
      // doesn't actually change the components ... its Reflecting config just stores state,
      // but these Reflecting configs (title, body, footer) do change the components based on
      // the received broadcasts.
      root.getSystem().broadcastOn([ `${titleChannel}-${id}` ], dialogInit.internalDialog);
      root.getSystem().broadcastOn([ `${bodyChannel}-${id}` ], dialogInit.internalDialog);
      root.getSystem().broadcastOn([ `${footerChannel}-${id}` ], {
        ...dialogInit.internalDialog,
        buttons: storedMenuButtons
      });

      instanceApi.setData(dialogInit.initialData as T);
    });
  };

  const close = () => {
    withRoot((root) => {
      AlloyTriggers.emit(root, formCloseEvent);
    });
  };

  const instanceApi = {
    getData,
    setData,
    setEnabled,
    focus,
    block,
    unblock,
    showTab,
    redial,
    close,
    toggleFullscreen: access.toggleFullscreen
  };

  return instanceApi;
};

export {
  getDialogApi
};
