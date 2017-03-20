define(
  'ephox.alloy.keying.EscapingType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.data.Fields',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (Keys, Fields, KeyingType, KeyMatch, KeyRules, Fun, Option) {
    var schema = [
      Fields.onStrictKeyboardHandler('onEscape')
    ];

    var doEscape = function (component, simulatedEvent, escapeInfo) {
      return escapeInfo.onEscape()(component, simulatedEvent);
    };
    
    var getRules = Fun.constant([
      KeyRules.rule( KeyMatch.inSet(Keys.ESCAPE()), doEscape)
    ]);

    var getEvents = Fun.constant({ });
    var getApis = Fun.constant({ });

    return KeyingType.typical(schema, getRules, getEvents, getApis, Option.none());
  }
);