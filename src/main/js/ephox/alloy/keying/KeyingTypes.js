define(
  'ephox.alloy.keying.KeyingTypes',

  [
    'ephox.alloy.alien.EditableFields',
    'ephox.alloy.api.SystemEvents',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (EditableFields, SystemEvents, Merger, Fun, Option) {

    var doDefaultExecute = function (component, simulatedEvent, focused) {
      var system = component.getSystem();
      system.triggerEvent(SystemEvents.execute(), focused, Merger.deepMerge({
        target: Fun.constant(component.element())
      }, simulatedEvent.event()));
      return Option.some(true);
    };

    var defaultExecute = function (component, simulatedEvent, focused) {
      return EditableFields.inside(focused) ? Option.none() : doDefaultExecute(component, simulatedEvent, focused);
    };

    return {
      defaultExecute: defaultExecute
    };
  }
);