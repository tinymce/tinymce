define(
  'ephox.alloy.keying.MenuType',

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
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.SelectorFind'
  ],

  function (EditableFields, Keys, KeyingType, KeyingTypes, DomMovement, DomNavigation, KeyMatch, KeyRules, FieldSchema, Fun, Option, Class, Focus, SelectorFind) {
    // FIX: Dupe with Flowtype
    var schema = [
      FieldSchema.strict('selector'),
      FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
      FieldSchema.option('onRight'),
      FieldSchema.option('onLeft'),
      FieldSchema.option('onEscape'),
      FieldSchema.defaulted('moveOnTab', false)
    ];

    var executeIfNotEditable = function (component, simulatedEvent, menuInfo) {
      return EditableFields.inside(simulatedEvent.event().target()) ? Option.none() : execute(component, simulatedEvent, menuInfo);
    };

    var execute = function (component, simulatedEvent, menuInfo) {
      var getFocus = function () {
        return menuInfo.focusManager().fold(function () {
          return Focus.search(component.element());
        }, function (manager) {
          return manager.get(component);
        });
      };

      return getFocus().bind(function (focused) {
        return menuInfo.execute()(component, simulatedEvent, focused);
      });
    };

    var focusIn = function (component, menuInfo, simulatedEvent) {
      menuInfo.focusManager().fold(function () {
        SelectorFind.descendant(component.element(), menuInfo.selector()).each(function (first) {
          component.getSystem().triggerFocus(first, component.element());
        });  
      }, function (manager) {
        SelectorFind.descendant(component.element(), menuInfo.selector()).each(function (first) {
          // This is bypassing highlight which is accidentally good. Will need to get all of this
          // behaviour consistent. The reason it is accidentally good is because when implementing
          // the typeahead, I don't want the first preview one to update the input field ... although
          // I sort of do.\
          manager.set(component, first);
        });  
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
      KeyRules.rule( KeyMatch.inSet( Keys.ENTER() ), execute),
      KeyRules.rule( KeyMatch.inSet( Keys.SPACE() ), executeIfNotEditable)
    ]);

    var getEvents = Fun.constant({ });

    var getApis = Fun.constant({ });

    return KeyingType.typical(schema, getRules, getEvents, getApis, Option.some(focusIn));
  }
);