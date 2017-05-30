define(
  'ephox.alloy.api.events.AlloyTriggers',

  [
    'ephox.alloy.api.events.SystemEvents',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Obj'
  ],

  function (SystemEvents, Fun, Merger, Obj) {
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

    return {
      emit: emit,
      emitWith: emitWith,
      emitExecute: emitExecute,
      dispatch: dispatch,
      dispatchWith: dispatchWith,
      dispatchEvent: dispatchEvent,
      dispatchFocus: dispatchFocus
    };
  }
);
