/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloyEvents, AlloyTriggers, CustomEvent, Keying, NativeEvents, Reflecting, Representing } from '@ephox/alloy';
import { DialogManager, Types } from '@ephox/bridge';
import { HTMLElement } from '@ephox/dom-globals';
import { Result } from '@ephox/katamari';
import { Attr, Compare, Element, Focus } from '@ephox/sugar';

import {
  formActionEvent, FormActionEvent, formBlockEvent, FormBlockEvent, formCancelEvent, FormCancelEvent, FormChangeEvent, formChangeEvent,
  FormCloseEvent, formCloseEvent, FormSubmitEvent, formSubmitEvent, formTabChangeEvent, FormTabChangeEvent, formUnblockEvent,
  FormUnblockEvent
} from '../general/FormEvents';
import * as NavigableObject from '../general/NavigableObject';

export interface ExtraListeners {
  onBlock: (blockEvent: FormBlockEvent) => void;
  onUnblock: () => void;
  onClose: () => void;
}

const initCommonEvents = (fireApiEvent: <E extends CustomEvent>(name: string, f: Function) => any, extras: ExtraListeners) => [
  // When focus moves onto a tab-placeholder, skip to the next thing in the tab sequence
  AlloyEvents.runWithTarget(NativeEvents.focusin(), NavigableObject.onFocus),

  // TODO: Test if disabled first.
  fireApiEvent<FormCloseEvent>(formCloseEvent, (_api, spec) => {
    extras.onClose();
    spec.onClose();
  }),

  // TODO: Test if disabled first.
  fireApiEvent<FormCancelEvent>(formCancelEvent, (api, spec, _event, self) => {
    spec.onCancel(api);
    AlloyTriggers.emit(self, formCloseEvent);
  }),

  AlloyEvents.run<FormUnblockEvent>(formUnblockEvent, (_c, _se) => extras.onUnblock()),

  AlloyEvents.run<FormBlockEvent>(formBlockEvent, (_c, se) => extras.onBlock(se.event()))
];

const initUrlDialog = <T>(getInstanceApi: () => Types.UrlDialog.UrlDialogInstanceApi, extras: ExtraListeners) => {
  const fireApiEvent = <E extends CustomEvent>(eventName: string, f: (api: Types.UrlDialog.UrlDialogInstanceApi, spec: Types.UrlDialog.UrlDialog, e: E, c: AlloyComponent) => void) => AlloyEvents.run<E>(eventName, (c, se) => {
    withSpec(c, (spec, _c) => {
      f(getInstanceApi(), spec, se.event(), c);
    });
  });

  const withSpec = (c: AlloyComponent, f: (spec: Types.UrlDialog.UrlDialog, c: AlloyComponent) => void): void => {
    Reflecting.getState(c).get().each((currentDialog: Types.UrlDialog.UrlDialog) => {
      f(currentDialog, c);
    });
  };
  return [
    ...initCommonEvents(fireApiEvent, extras),

    fireApiEvent<FormActionEvent>(formActionEvent, (api, spec, event) => {
      spec.onAction(api, { name: event.name() });
    })
  ];
};

const initDialog = <T>(getInstanceApi: () => Types.Dialog.DialogInstanceApi<T>, extras: ExtraListeners, getSink: () => Result<AlloyComponent, any>) => {
  const fireApiEvent = <E extends CustomEvent>(eventName: string, f: (api: Types.Dialog.DialogInstanceApi<T>, spec: Types.Dialog.Dialog<T>, e: E, c: AlloyComponent) => void) => AlloyEvents.run<E>(eventName, (c, se) => {
    withSpec(c, (spec, _c) => {
      f(getInstanceApi(), spec, se.event(), c);
    });
  });

  const withSpec = (c: AlloyComponent, f: (spec: Types.Dialog.Dialog<T>, c: AlloyComponent) => void): void => {
    Reflecting.getState(c).get().each((currentDialogInit: DialogManager.DialogInit<T>) => {
      f(currentDialogInit.internalDialog, c);
    });
  };

  return [
    ...initCommonEvents(fireApiEvent, extras),

    fireApiEvent<FormSubmitEvent>(formSubmitEvent, (api, spec) => spec.onSubmit(api)),

    fireApiEvent<FormChangeEvent<T>>(formChangeEvent, (api, spec, event) => {
      spec.onChange(api, { name: event.name() });
    }),

    fireApiEvent<FormActionEvent>(formActionEvent, (api, spec, event, component) => {
      const focusIn = () => Keying.focusIn(component);
      const isDisabled = (focused: Element<HTMLElement>) => Attr.has(focused, 'disabled') || Attr.getOpt(focused, 'aria-disabled').exists((val) => val === 'true');
      const current = Focus.active();

      spec.onAction(api, { name: event.name(), value: event.value() });

      Focus.active().fold(focusIn, (focused) => {
        // We need to check if the focused element is disabled because apparently firefox likes to leave focus on disabled elements.
        if (isDisabled(focused)) {
          focusIn();
        // And we need the below check for IE, which likes to leave focus on the parent of disabled elements
        } else if (current.exists((cur) => Compare.contains(focused, cur) && isDisabled(cur))) {
          focusIn();
        // Lastly if something outside the sink has focus then return the focus back to the dialog
        } else {
          getSink().toOption()
            .filter((sink) => !Compare.contains(sink.element(), focused))
            .each(focusIn);
        }
      });
    }),

    fireApiEvent<FormTabChangeEvent>(formTabChangeEvent, (api, spec, event) => {
      spec.onTabChange(api, { newTabName: event.name(), oldTabName: event.oldName() });
    }),

    // When the dialog is being closed, store the current state of the form
    AlloyEvents.runOnDetached((component) => {
      const api = getInstanceApi();
      Representing.setValue(component, api.getData());
    })
  ];
};

export const SilverDialogEvents = {
  initUrlDialog,
  initDialog
};
