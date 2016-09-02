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
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Keys, SystemEvents, EventHandler, KeyingType, KeyingTypes, DomMovement, DomNavigation, KeyMatch, KeyRules, FieldSchema, Objects, Fun, Focus, SelectorFind) {
    var schema = [
      FieldSchema.strict('selector'),
      FieldSchema.defaulted('execute', KeyingTypes.defaultExecute)
    ];

    var execute = function (component, simulatedEvent, flowInfo) {
      return Focus.search(component.element()).each(function (focused) {
        flowInfo.execute()(component, simulatedEvent, focused);
        return true;
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

    var getEvents = function (flowInfo) {
      return Objects.wrapAll([
        { 
          key: SystemEvents.focus(),
          value: EventHandler.nu({
            run: function (component) {
              // Find a target inside the component
              focusIn(component, flowInfo);
            }
          })
        }
      ]);
    };

    var getApis = Fun.constant({ });
    return KeyingType(schema, getRules, getEvents, getApis);
  }
);