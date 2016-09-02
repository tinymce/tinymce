define(
  'ephox.alloy.keying.EscapingType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Keys, KeyingType, KeyMatch, KeyRules, FieldSchema, Fun, Option) {
    var schema = [
      FieldSchema.strict('onEscape')
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