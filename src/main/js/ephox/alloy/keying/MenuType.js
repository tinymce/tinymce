define(
  'ephox.alloy.keying.MenuType',

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
    // FIX: Dupe with Flowtype
    var schema = [
      FieldSchema.strict('selector'),
      FieldSchema.defaulted('execute', KeyingTypes.sdefaultExecute),
      FieldSchema.option('onRight'),
      FieldSchema.option('onLeft'),
      FieldSchema.option('onEscape'),
      FieldSchema.option('onShiftTab'),
      FieldSchema.defaulted('moveOnTab', false)
    ];

    var execute = function (component, simulatedEvent, menuInfo) {
      return Focus.search(component.element()).each(function (focused) {
        menuInfo.execute()(component, simulatedEvent, focused);
        return true;
      });
    };

    var focusIn = function (component, menuInfo) {
      SelectorFind.descendant(component.element(), menuInfo.selector()).each(function (first) {
        component.getSystem().triggerFocus(first, component.element());
      });
    };

    var moveUp = function (element, focused, info) {
      return DomNavigation.horizontal(element, info.selector(), focused, -1);
    };

    var moveDown = function (element, focused, info) {
      return DomNavigation.horizontal(element, info.selector(), focused, +1);
    };

    var fire = function (onHandler) {
      return function (component, simulatedEvent, menuInfo) {
        return menuInfo[onHandler]().bind(function (h) {
          return h(component, simulatedEvent.event().target());
        });
      };
    };

    var fireShiftTab = function (component, simulatedEvent, menuInfo) {
      return menuInfo.moveOnTab() ? DomMovement.move(moveUp)(component, simulatedEvent, menuInfo) : Option.none();
    };

    var fireTab = function (component, simulatedEvent, menuInfo) {
      return menuInfo.moveOnTab() ? DomMovement.move(moveDown)(component, simulatedEvent, menuInfo) : Option.none();
    };

    var getRules = Fun.constant([
      KeyRules.rule( KeyMatch.inSet( Keys.UP() ), DomMovement.move(moveUp)),
      KeyRules.rule( KeyMatch.inSet( Keys.DOWN() ), DomMovement.move(moveDown)),
      KeyRules.rule( KeyMatch.inSet( Keys.RIGHT() ), fire('onRight')),
      KeyRules.rule( KeyMatch.inSet( Keys.LEFT() ), fire('onLeft')),
      KeyRules.rule( KeyMatch.inSet( Keys.ESCAPE() ), fire('onEscape')),
      KeyRules.rule( KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB()) ]), fireShiftTab),
      KeyRules.rule( KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet( Keys.TAB()) ]), fireTab),
      KeyRules.rule( KeyMatch.inSet( Keys.SPACE().concat(Keys.ENTER()) ), execute)
    ]);

    var getEvents = function (menuInfo) {
      return Objects.wrapAll([
        { 
          key: SystemEvents.focus(),
          value: EventHandler.nu({
            run: function (component) {
              // Find a target inside the component
              focusIn(component, menuInfo);
            }
          })
        }
      ]);
    };

    var getApis = Fun.constant({ });

    return KeyingType(schema, getRules, getEvents, getApis);
  }
);