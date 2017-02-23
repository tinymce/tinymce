define(
  'ephox.alloy.keying.KeyingTypes',

  [
    'ephox.alloy.alien.EditableFields',
    'ephox.alloy.alien.Keys',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (EditableFields, Keys, SystemEvents, KeyMatch, KeyRules, Merger, Fun, Option) {

    var doDefaultExecute = function (component, simulatedEvent, focused) {
      var system = component.getSystem();
      system.triggerEvent(SystemEvents.execute(), focused, Merger.deepMerge({
        target: Fun.constant(component.element())
      }, simulatedEvent.event()));
      return Option.some(true);
    };

    var defaultExecute = function (component, simulatedEvent, focused) {
      return EditableFields.inside(focused) && KeyMatch.inSet(Keys.SPACE())(simulatedEvent.event()) ? Option.none() : doDefaultExecute(component, simulatedEvent, focused);
    };

    return {
      defaultExecute: defaultExecute
    };
  }
);