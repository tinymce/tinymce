define(
  'ephox.alloy.keying.EscapingType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.behaviour.common.NoState',
    'ephox.alloy.data.Fields',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (Keys, NoState, Fields, KeyingType, KeyMatch, KeyRules, Fun, Option) {
    var schema = [
      Fields.onStrictKeyboardHandler('onEscape')
    ];

    var doEscape = function (component, simulatedEvent, escapeConfig, escapeState) {
      return escapeConfig.onEscape()(component, simulatedEvent);
    };

    var getRules = Fun.constant([
      KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE()), doEscape)
    ]);

    var getEvents = Fun.constant({ });
    var getApis = Fun.constant({ });

    return KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.none());
  }
);