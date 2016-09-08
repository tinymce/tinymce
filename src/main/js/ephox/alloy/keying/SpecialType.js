define(
  'ephox.alloy.keying.SpecialType',

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
      FieldSchema.defaulted('onSpace', Option.none),
      FieldSchema.defaulted('onEnter', Option.none),
      FieldSchema.defaulted('onShiftEnter', Option.none),
      FieldSchema.defaulted('onLeft', Option.none),
      FieldSchema.defaulted('onRight', Option.none),
      FieldSchema.defaulted('onUp', Option.none),
      FieldSchema.defaulted('onDown', Option.none),
      FieldSchema.defaulted('onEscape', Option.none)
    ];
    
    var getRules = function (component, simulatedEvent, executeInfo) {
      return [
        KeyRules.rule( KeyMatch.inSet(Keys.SPACE()), executeInfo.onSpace()),
        KeyRules.rule(
          KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet( Keys.ENTER()) ]), executeInfo.onEnter()
        ),
        KeyRules.rule(
          KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet( Keys.ENTER()) ]), executeInfo.onShiftEnter()
        ),
        KeyRules.rule( KeyMatch.inSet(Keys.UP()), executeInfo.onUp()),
        KeyRules.rule( KeyMatch.inSet(Keys.DOWN()), executeInfo.onDown()),
        KeyRules.rule( KeyMatch.inSet(Keys.LEFT()), executeInfo.onLeft()),
        KeyRules.rule( KeyMatch.inSet(Keys.RIGHT()), executeInfo.onRight()),
        KeyRules.rule( KeyMatch.inSet(Keys.SPACE()), executeInfo.onSpace()),
        KeyRules.rule( KeyMatch.inSet(Keys.ESCAPE()), executeInfo.onEscape())
      ];
    };

    var getEvents = Fun.constant({ });
    var getApis = Fun.constant({ });

    return KeyingType.typical(schema, getRules, getEvents, getApis, Option.none());
  }
);