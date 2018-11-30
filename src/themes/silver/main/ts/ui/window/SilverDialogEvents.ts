/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AlloyComponent,
  AlloyEvents,
  AlloyTriggers,
  CustomEvent,
  NativeEvents,
  Reflecting,
  Representing,
} from '@ephox/alloy';
import { DialogManager, Types } from '@ephox/bridge';

import {
  formActionEvent,
  FormActionEvent,
  formBlockEvent,
  formCancelEvent,
  FormCancelEvent,
  FormChangeEvent,
  formChangeEvent,
  FormCloseEvent,
  formCloseEvent,
  FormBlockEvent,
  FormSubmitEvent,
  formSubmitEvent,
  formUnblockEvent,
  FormUnblockEvent,
  formTabChangeEvent,
  FormTabChangeEvent,
} from '../general/FormEvents';
import NavigableObject from '../general/NavigableObject';

export interface ExtraListeners {
  onBlock: (blockEvent: FormBlockEvent) => void;
  onUnblock: () => void;
  onClose: () => void;
}

const init = <T>(getInstanceApi: () => Types.Dialog.DialogInstanceApi<T>, extras: ExtraListeners) => {
  const fireApiEvent = <E extends CustomEvent>(eventName: string, f: (spec: Types.Dialog.Dialog<T>, e: E, c: AlloyComponent) => void) => {
    return AlloyEvents.run<E>(eventName, (c, se) => {
      withSpec(c, (spec, _c) => {
        f(spec, se.event(), c);
      });
    });
  };

  const withSpec = (c: AlloyComponent, f: (spec: Types.Dialog.Dialog<T>, c: AlloyComponent) => void): void => {
    Reflecting.getState(c).get().each((currentDialogInit: DialogManager.DialogInit<T>) => {
      f(currentDialogInit.internalDialog, c);
    });
  };

  return [
    // When focus moves onto a tab-placeholder, skip to the next thing in the tab sequence
    AlloyEvents.runWithTarget(NativeEvents.focusin(), NavigableObject.onFocus),

    fireApiEvent<FormSubmitEvent>(formSubmitEvent, (spec) => spec.onSubmit(getInstanceApi())),

    fireApiEvent<FormChangeEvent<T>>(formChangeEvent, (spec, event) => {
      spec.onChange(getInstanceApi(), { name: event.name() });
    }),

    fireApiEvent<FormActionEvent>(formActionEvent, (spec, event) => {
      spec.onAction(getInstanceApi(), { name: event.name(), value: event.value() });
    }),

    fireApiEvent<FormTabChangeEvent>(formTabChangeEvent, (spec, event) => {
      spec.onTabChange(getInstanceApi(), event.title());
    }),

    // TODO: Test if disabled first.
    fireApiEvent<FormCloseEvent>(formCloseEvent, (spec) => {
      extras.onClose();
      spec.onClose();
    }),

    // TODO: Test if disabled first.
    fireApiEvent<FormCancelEvent>(formCancelEvent, (spec, _event, self) => {
      spec.onCancel(getInstanceApi());
      AlloyTriggers.emit(self, formCloseEvent);
    }),

    // When the dialog is being closed, store the current state of the form
    AlloyEvents.runOnDetached((component) => {
      const api = getInstanceApi();
      Representing.setValue(component, api.getData());
    }),

    AlloyEvents.run<FormUnblockEvent>(formUnblockEvent, (c, se) => extras.onUnblock()),

    AlloyEvents.run<FormBlockEvent>(formBlockEvent, (c, se) => extras.onBlock(se.event()))
  ];
};

export const SilverDialogEvents = {
  init
};