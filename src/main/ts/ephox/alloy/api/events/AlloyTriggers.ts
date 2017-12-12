import SystemEvents from './SystemEvents';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';

var emit = function (component, event) {
  dispatchWith(component, component.element(), event, { });
};

var emitWith = function (component, event, properties) {
  dispatchWith(component, component.element(), event, properties);
};

var emitExecute = function (component) {
  emit(component, SystemEvents.execute());
};

var dispatch = function (component, target, event) {
  dispatchWith(component, target, event, { });
};

var dispatchWith = function (component, target, event, properties) {
  var data = Merger.deepMerge({
    target: target
  }, properties);
  component.getSystem().triggerEvent(event, target, Obj.map(data, Fun.constant));
};

var dispatchEvent = function (component, target, event, simulatedEvent) {
  component.getSystem().triggerEvent(event, target, simulatedEvent.event());
};

var dispatchFocus = function (component, target) {
  component.getSystem().triggerFocus(target, component.element());
};

export default <any> {
  emit: emit,
  emitWith: emitWith,
  emitExecute: emitExecute,
  dispatch: dispatch,
  dispatchWith: dispatchWith,
  dispatchEvent: dispatchEvent,
  dispatchFocus: dispatchFocus
};