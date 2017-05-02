define(
  'ephox.alloy.keying.FlatgridType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.behaviour.keyboard.KeyingState',
    'ephox.alloy.data.Fields',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.keying.KeyingTypes',
    'ephox.alloy.navigation.DomMovement',
    'ephox.alloy.navigation.DomPinpoint',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.alloy.navigation.WrapArrNavigation',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (
    Keys, KeyingState, Fields, KeyingType, KeyingTypes, DomMovement, DomPinpoint, KeyMatch, KeyRules, WrapArrNavigation, FieldSchema, Cell, Fun, Option, Focus,
    SelectorFind
  ) {
    var schema = [
      FieldSchema.strict('selector'),
      FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
      Fields.onKeyboardHandler('onEscape'),
      FieldSchema.defaulted('captureTab', false),
      Fields.initSize()
    ];

    var focusIn = function (component, gridConfig, gridState) {
      SelectorFind.descendant(component.element(), gridConfig.selector()).each(function (first) {
        component.getSystem().triggerFocus(first, component.element());
      });
    };

    var execute = function (component, simulatedEvent, gridConfig, gridState) {
      return Focus.search(component.element(), gridConfig.selector()).bind(function (focused) {
        return gridConfig.execute()(component, simulatedEvent, focused);
      });
    };

    var doMove = function (cycle) {
      return function (element, focused, gridConfig, gridState) {
        return DomPinpoint.locateVisible(element, focused, gridConfig.selector()).bind(function (identified) {
          return cycle(
            identified.candidates(),
            identified.index(),
            gridState.getNumRows().getOr(gridConfig.initSize().numRows()),
            gridState.getNumColumns().getOr(gridConfig.initSize().numColumns())
          );
        });
      };
    };

    var handleTab = function (component, simulatedEvent, gridConfig, gridState) {
      return gridConfig.captureTab() ? Option.some(true) : Option.none();
    };

    var doEscape = function (component, simulatedEvent, gridConfig, gridState) {
      return gridConfig.onEscape()(component, simulatedEvent);
    };

    var moveLeft = doMove(WrapArrNavigation.cycleLeft);
    var moveRight = doMove(WrapArrNavigation.cycleRight);
    
    var moveNorth = doMove(WrapArrNavigation.cycleUp);
    var moveSouth = doMove(WrapArrNavigation.cycleDown);

    var getRules = Fun.constant([
      KeyRules.rule( KeyMatch.inSet( Keys.LEFT() ), DomMovement.west(moveLeft, moveRight)),
      KeyRules.rule( KeyMatch.inSet( Keys.RIGHT() ), DomMovement.east(moveLeft, moveRight)),
      KeyRules.rule( KeyMatch.inSet( Keys.UP() ), DomMovement.north(moveNorth)),
      KeyRules.rule( KeyMatch.inSet( Keys.DOWN() ), DomMovement.south(moveSouth)),
      KeyRules.rule( KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB()) ]), handleTab),
      KeyRules.rule( KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet( Keys.TAB()) ]), handleTab),
      KeyRules.rule( KeyMatch.inSet( Keys.ESCAPE() ), doEscape),

      KeyRules.rule( KeyMatch.inSet( Keys.SPACE().concat(Keys.ENTER()) ), execute)
    ]);

    var getEvents = Fun.constant({ });

    var getApis = {};

    return KeyingType.typical(schema, KeyingState.flatgrid, getRules, getEvents, getApis, Option.some(focusIn));
  }
);