define(
  'ephox.alloy.keying.EscapingType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (Keys, KeyingType, KeyMatch, KeyRules, FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('onEscape')
    ];

    var doEscape = function (component, simulatedEvent, escapeInfo) {
      return escapeInfo.onEscape()(component, simulatedEvent);
    };
    
    var getRules = function (component, simulatedEvent, escapeInfo) {
      return [
        KeyRules.rule( KeyMatch.inSet(Keys.ESCAPE()), doEscape)
      ];
    };

    var getEvents = Fun.constant({ });
    var getApis = Fun.constant({ });

    return KeyingType(schema, getRules, getEvents, getApis);
  }
);