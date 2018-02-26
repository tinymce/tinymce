import { Fun, Merger, Obj } from '@ephox/katamari';

import SystemEvents from './SystemEvents';

const emit = function (component, event) {
  dispatchWith(component, component.element(), event, { });
};

const emitWith = function (component, event, properties) {
  dispatchWith(component, component.element(), event, properties);
};

const emitExecute = function (component) {
  emit(component, SystemEvents.execute());
};

const dispatch = function (component, target, event) {
  dispatchWith(component, target, event, { });
};

const dispatchWith = function (component, target, event, properties) {
  const data = Merger.deepMerge({
    target
  }, properties);
  component.getSystem().triggerEvent(event, target, Obj.map(data, Fun.constant));
};

const dispatchEvent = function (component, target, event, simulatedEvent) {
  component.getSystem().triggerEvent(event, target, simulatedEvent.event());
};

const dispatchFocus = function (component, target) {
  component.getSystem().triggerFocus(target, component.element());
};

export {
  emit,
  emitWith,
  emitExecute,
  dispatch,
  dispatchWith,
  dispatchEvent,
  dispatchFocus
};