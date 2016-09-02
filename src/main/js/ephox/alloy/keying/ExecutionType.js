define(
  'ephox.alloy.keying.ExecutionType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.keying.KeyingTypes',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Keys, KeyingType, KeyingTypes, KeyMatch, KeyRules, FieldSchema, Fun, Option) {
    var schema = [
      FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
      FieldSchema.defaulted('useSpace', false),
      FieldSchema.defaulted('useEnter', true),
      FieldSchema.defaulted('useDown', false)
    ];

    var execute = function (component, simulatedEvent, executeInfo) {
      executeInfo.execute()(component, simulatedEvent, component.element());
      return Option.some(true);
    };
    
    var getRules = function (component, simulatedEvent, executeInfo) {
      var spaceExec = executeInfo.useSpace() ? Keys.SPACE() : [ ];
      var enterExec = executeInfo.useEnter() ? Keys.ENTER() : [ ];
      var downExec = executeInfo.useDown() ? Keys.DOWN() : [ ];
      var execKeys = spaceExec.concat(enterExec).concat(downExec);

      return [
        KeyRules.rule( KeyMatch.inSet(execKeys), execute)
      ];
    };

    var getEvents = Fun.constant({ });
    var getApis = Fun.constant({ });

    return KeyingType.typical(schema, getRules, getEvents, getApis, Option.none());
  }
);