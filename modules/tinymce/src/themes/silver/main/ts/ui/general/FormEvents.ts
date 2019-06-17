/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Id } from '@ephox/katamari';
import { CustomEvent } from '@ephox/alloy';

export interface FormChangeEvent<T> extends CustomEvent {
  name: () => keyof T;
}

// tslint:disable-next-line:no-empty-interface
export interface FormCloseEvent extends CustomEvent {

}

// tslint:disable-next-line:no-empty-interface
export interface FormCancelEvent extends CustomEvent {

}

export interface FormActionEvent extends CustomEvent {
  name: () => string;
  value: () => any;
}

// tslint:disable-next-line:no-empty-interface
export interface FormSubmitEvent extends CustomEvent {

}

// tslint:disable-next-line:no-empty-interface
export interface FormBlockEvent extends CustomEvent {
  message: () => string;
}

// tslint:disable-next-line:no-empty-interface
export interface FormUnblockEvent extends CustomEvent {

}

export interface FormTabChangeEvent extends CustomEvent {
  name: () => string;
  oldName: () => string;
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