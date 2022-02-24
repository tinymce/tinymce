import { CustomEvent } from '@ephox/alloy';
import { Id } from '@ephox/katamari';

export interface FormChangeEvent<T> extends CustomEvent {
  readonly name: keyof T;
}

// tslint:disable-next-line:no-empty-interface
export interface FormCloseEvent extends CustomEvent {

}

// tslint:disable-next-line:no-empty-interface
export interface FormCancelEvent extends CustomEvent {

}

export interface FormActionEvent extends CustomEvent {
  readonly name: string;
  readonly value: any;
}

// tslint:disable-next-line:no-empty-interface
export interface FormSubmitEvent extends CustomEvent {

}

// tslint:disable-next-line:no-empty-interface
export interface FormBlockEvent extends CustomEvent {
  readonly message: string;
}

// tslint:disable-next-line:no-empty-interface
export interface FormUnblockEvent extends CustomEvent {

}

export interface FormTabChangeEvent extends CustomEvent {
  readonly name: string;
  readonly oldName: string;
}

const formChangeEvent = Id.generate('form-component-change');
const formCloseEvent = Id.generate('form-close');
const formCancelEvent = Id.generate('form-cancel');
const formActionEvent = Id.generate('form-action');
const formSubmitEvent = Id.generate('form-submit');
const formBlockEvent = Id.generate('form-block');
const formUnblockEvent = Id.generate('form-unblock');
const formTabChangeEvent = Id.generate('form-tabchange');
const formResizeEvent = Id.generate('form-resize');

export {
  formChangeEvent,
  formActionEvent,
  formSubmitEvent,
  formCloseEvent,
  formCancelEvent,
  formBlockEvent,
  formUnblockEvent,
  formTabChangeEvent,
  formResizeEvent
};
