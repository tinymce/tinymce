import { AlloyComponent, AlloyEvents, AlloyTriggers, CustomEvent, Keying, NativeEvents, Reflecting, Representing } from '@ephox/alloy';
import { Dialog, DialogManager } from '@ephox/bridge';
import { Result, Fun } from '@ephox/katamari';
import { Attribute, Compare, Focus, SugarElement, SugarShadowDom } from '@ephox/sugar';

import {
  formActionEvent, FormActionEvent, formBlockEvent, FormBlockEvent, FormCancelEvent, formCancelEvent, FormChangeEvent, formChangeEvent,
  FormCloseEvent,
  formCloseEvent,
  FormSubmitEvent, formSubmitEvent, formTabChangeEvent, FormTabChangeEvent, formUnblockEvent, FormUnblockEvent
} from '../general/FormEvents';
import * as NavigableObject from '../general/NavigableObject';

export interface ExtraListeners {
  readonly onBlock: (blockEvent: FormBlockEvent) => void;
  readonly onUnblock: () => void;
  readonly onClose: () => void;
}

interface EventSpec<A> {
  readonly onClose: () => void;
  readonly onCancel: (api: A) => void;
}

type FireApiCallback<A, S extends EventSpec<A>, E extends CustomEvent> = (api: A, spec: S, event: E, self: AlloyComponent) => void;
type FireApiFunc<A, S extends EventSpec<A>> = <E extends CustomEvent>(name: string, f: FireApiCallback<A, S, E>) => AlloyEvents.AlloyEventKeyAndHandler<E>;

const initCommonEvents = <A, S extends EventSpec<A>>(fireApiEvent: FireApiFunc<A, S>, extras: ExtraListeners): AlloyEvents.AlloyEventKeyAndHandler<any>[] => [
  // When focus moves onto a tab-placeholder, skip to the next thing in the tab sequence
  AlloyEvents.runWithTarget(NativeEvents.focusin(), NavigableObject.onFocus),

  // TODO: Test if disabled first.
  fireApiEvent<FormCloseEvent>(formCloseEvent, (_api: A, spec: S, _event, self) => {
    // TINY-9148: Safari scrolls down to the sink if the dialog is selected before removing,
    // so we should blur the currently active element beforehand.
    Focus.active(SugarShadowDom.getRootNode(self.element)).fold(Fun.noop, Focus.blur);
    extras.onClose();
    spec.onClose();
  }),

  // TODO: Test if disabled first.
  fireApiEvent<FormCancelEvent>(formCancelEvent, (api, spec, _event, self) => {
    spec.onCancel(api);
    AlloyTriggers.emit(self, formCloseEvent);
  }),

  AlloyEvents.run<FormUnblockEvent>(formUnblockEvent, (_c, _se) => extras.onUnblock()),

  AlloyEvents.run<FormBlockEvent>(formBlockEvent, (_c, se) => extras.onBlock(se.event))
];

const initUrlDialog = (getInstanceApi: () => Dialog.UrlDialogInstanceApi, extras: ExtraListeners): AlloyEvents.AlloyEventKeyAndHandler<any>[] => {
  const fireApiEvent: FireApiFunc<Dialog.UrlDialogInstanceApi, Dialog.UrlDialog> = (eventName, f) =>
    AlloyEvents.run(eventName, (c, se) => {
      withSpec(c, (spec, _c) => {
        f(getInstanceApi(), spec, se.event, c);
      });
    });

  const withSpec = (c: AlloyComponent, f: (spec: Dialog.UrlDialog, c: AlloyComponent) => void): void => {
    Reflecting.getState(c).get().each((currentDialog: Dialog.UrlDialog) => {
      f(currentDialog, c);
    });
  };
  return [
    ...initCommonEvents<Dialog.UrlDialogInstanceApi, Dialog.UrlDialog>(fireApiEvent, extras),

    fireApiEvent<FormActionEvent>(formActionEvent, (api, spec, event) => {
      spec.onAction(api, { name: event.name });
    })
  ];
};

const initDialog = <T extends Dialog.DialogData>(getInstanceApi: () => Dialog.DialogInstanceApi<T>, extras: ExtraListeners, getSink: () => Result<AlloyComponent, any>): AlloyEvents.AlloyEventKeyAndHandler<any>[] => {
  const fireApiEvent: FireApiFunc<Dialog.DialogInstanceApi<T>, Dialog.Dialog<T>> = (eventName, f) =>
    AlloyEvents.run(eventName, (c, se) => {
      withSpec(c, (spec, _c) => {
        f(getInstanceApi(), spec, se.event, c);
      });
    });

  const withSpec = (c: AlloyComponent, f: (spec: Dialog.Dialog<T>, c: AlloyComponent) => void): void => {
    Reflecting.getState(c).get().each((currentDialogInit: DialogManager.DialogInit<T>) => {
      f(currentDialogInit.internalDialog, c);
    });
  };

  return [
    ...initCommonEvents<Dialog.DialogInstanceApi<T>, Dialog.Dialog<T>>(fireApiEvent, extras),

    fireApiEvent<FormSubmitEvent>(formSubmitEvent, (api, spec) => spec.onSubmit(api)),

    fireApiEvent<FormChangeEvent<T>>(formChangeEvent, (api, spec, event) => {
      spec.onChange(api, { name: event.name });
    }),

    fireApiEvent<FormActionEvent>(formActionEvent, (api, spec, event, component) => {
      // TODO: add a test for focusIn (TINY-10125)
      const focusIn = () => component.getSystem().isConnected() ? Keying.focusIn(component) : undefined;
      const isDisabled = (focused: SugarElement<HTMLElement>) => Attribute.has(focused, 'disabled') || Attribute.getOpt(focused, 'aria-disabled').exists((val) => val === 'true');
      const rootNode = SugarShadowDom.getRootNode(component.element);
      const current = Focus.active(rootNode);

      spec.onAction(api, { name: event.name, value: event.value });

      Focus.active(rootNode).fold(focusIn, (focused) => {
        // We need to check if the focused element is disabled because apparently firefox likes to leave focus on disabled elements.
        if (isDisabled(focused)) {
          focusIn();
        // And we need the below check for IE, which likes to leave focus on the parent of disabled elements
        } else if (current.exists((cur) => Compare.contains(focused, cur) && isDisabled(cur))) {
          focusIn();
        // Lastly if something outside the sink has focus then return the focus back to the dialog
        } else {
          getSink().toOptional()
            .filter((sink) => !Compare.contains(sink.element, focused))
            .each(focusIn);
        }
      });
    }),

    fireApiEvent<FormTabChangeEvent>(formTabChangeEvent, (api, spec, event) => {
      spec.onTabChange(api, { newTabName: event.name, oldTabName: event.oldName });
    }),

    // When the dialog is being closed, store the current state of the form
    AlloyEvents.runOnDetached((component) => {
      const api = getInstanceApi();
      Representing.setValue(component, api.getData());
    })
  ];
};

export {
  initUrlDialog,
  initDialog
};
