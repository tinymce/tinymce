define(
  'ephox.alloy.keying.KeyingTypes',

  [
    'ephox.alloy.api.SystemEvents',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (SystemEvents, Merger, Fun, Option) {
    var defaultExecute = function (component, simulatedEvent, focused) {
      var system = component.getSystem();
      system.triggerEvent(SystemEvents.execute(), focused, Merger.deepMerge({
        target: Fun.constant(component.element())
      }, simulatedEvent.event()));
      return Option.some(true);
    };

    return {
      defaultExecute: defaultExecute
    };
  }
);