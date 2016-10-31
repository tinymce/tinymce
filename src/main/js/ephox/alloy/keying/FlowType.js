define(
  'ephox.alloy.keying.FlowType',

  [
    'ephox.alloy.alien.EditableFields',
    'ephox.alloy.alien.Keys',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.keying.KeyingTypes',
    'ephox.alloy.navigation.DomMovement',
    'ephox.alloy.navigation.DomNavigation',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.SelectorFind'
  ],

  function (EditableFields, Keys, KeyingType, KeyingTypes, DomMovement, DomNavigation, KeyMatch, KeyRules, FieldSchema, Fun, Option, Focus, SelectorFind) {
    var schema = [
      FieldSchema.strict('selector'),
      FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
      FieldSchema.defaulted('executeOnMove', false)
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

    var doMove = function (movement) {
      return function (component, simulatedEvent, flowInfo) {
        return movement(component, simulatedEvent, flowInfo).bind(function () {
          return flowInfo.executeOnMove() ? execute(component, simulatedEvent, flowInfo) : Option.some(true);
        });
      };
    };

    var getRules = function (_) {
      return [
        KeyRules.rule( KeyMatch.inSet( Keys.LEFT().concat(Keys.UP()) ), doMove(DomMovement.west(moveLeft, moveRight))),
        KeyRules.rule( KeyMatch.inSet( Keys.RIGHT().concat(Keys.DOWN()) ), doMove(DomMovement.east(moveLeft, moveRight))),
        KeyRules.rule( KeyMatch.inSet( Keys.ENTER() ), execute),
        KeyRules.rule( KeyMatch.inSet( Keys.SPACE() ), execute)
      ];
    };

    var getEvents = Fun.constant({ });

    var getApis = Fun.constant({ });
    return KeyingType.typical(schema, getRules, getEvents, getApis, Option.some(focusIn));
  }
);