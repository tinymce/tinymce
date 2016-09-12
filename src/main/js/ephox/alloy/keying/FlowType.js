define(
  'ephox.alloy.keying.FlowType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.keying.KeyingTypes',
    'ephox.alloy.navigation.DomMovement',
    'ephox.alloy.navigation.DomNavigation',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Keys, SystemEvents, EventHandler, KeyingType, KeyingTypes, DomMovement, DomNavigation, KeyMatch, KeyRules, FieldSchema, Objects, Fun, Option, Focus, SelectorFind) {
    var schema = [
      FieldSchema.strict('selector'),
      FieldSchema.defaulted('execute', KeyingTypes.defaultExecute)
    ];

    var execute = function (component, simulatedEvent, flowInfo) {
      return Focus.search(component.element()).bind(function (focused) {
        return flowInfo.execute()(component, simulatedEvent, focused);
      });
    };

    var focusIn = function (component, flowInfo) {
      SelectorFind.descendant(component.element(), flowInfo.selector()).each(function (first) {
        component.getSystem().triggerFocus(first, component.element());
      });
    };

    var moveLeft = function (element, focused, info) {
      return DomNavigation.horizontal(element, info.selector(), focused, -1);
    };

    var moveRight = function (element, focused, info) {
      return DomNavigation.horizontal(element, info.selector(), focused, +1);
    };

    var getRules = function (_) {
      return [
        KeyRules.rule( KeyMatch.inSet( Keys.LEFT().concat(Keys.UP()) ), DomMovement.west(moveLeft, moveRight)),
        KeyRules.rule( KeyMatch.inSet( Keys.RIGHT().concat(Keys.DOWN()) ), DomMovement.east(moveLeft, moveRight)),
        KeyRules.rule( KeyMatch.inSet( Keys.SPACE().concat(Keys.ENTER()) ), execute)
      ];
    };

    var getEvents = Fun.constant({ });

    var getApis = Fun.constant({ });
    return KeyingType.typical(schema, getRules, getEvents, getApis, Option.some(focusIn));
  }
);