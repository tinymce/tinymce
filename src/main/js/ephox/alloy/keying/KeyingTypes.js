define(
  'ephox.alloy.keying.KeyingTypes',

  [
    'ephox.alloy.alien.EditableFields',
    'ephox.alloy.alien.Keys',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.katamari.api.Option'
  ],

  function (EditableFields, Keys, AlloyTriggers, SystemEvents, KeyMatch, Option) {

    var doDefaultExecute = function (component, simulatedEvent, focused) {
      // Note, we use to pass through simulatedEvent here and make target: component. This simplification
      // may be a problem
      AlloyTriggers.dispatch(component, focused, SystemEvents.execute());
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