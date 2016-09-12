define(
  'ephox.alloy.keying.FlatgridType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.keying.KeyingTypes',
    'ephox.alloy.navigation.DomMovement',
    'ephox.alloy.navigation.DomPinpoint',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.alloy.navigation.WrapArrNavigation',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Keys, KeyingType, KeyingTypes, DomMovement, DomPinpoint, KeyMatch, KeyRules, WrapArrNavigation, FieldSchema, Fun, Option, Cell, Focus, SelectorFind) {
    var schema = [
      FieldSchema.strict('selector'),
      FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
      FieldSchema.state('dimensions', function () {
        return Cell({
          numColumns: 1,
          numRows: 1
        });
      })
    ];

    var focusIn = function (component, gridInfo) {
      SelectorFind.descendant(component.element(), gridInfo.selector()).each(function (first) {
        component.getSystem().triggerFocus(first, component.element());
      });
    };

    var execute = function (component, simulatedEvent, gridInfo) {
      return Focus.search(component.element(), gridInfo.selector()).bind(function (focused) {
        return gridInfo.execute()(component, simulatedEvent, focused);
      });
    };

    var doMove = function (cycle) {
      return function (element, focused, info) {
        return DomPinpoint.locateVisible(element, focused, info.selector()).bind(function (identified) {
          return cycle(
            identified.candidates(),
            identified.index(),
            info.dimensions().get().numRows,
            info.dimensions().get().numColumns
          );
        });
      };
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
      KeyRules.rule( KeyMatch.inSet( Keys.SPACE().concat(Keys.ENTER()) ), execute)
    ]);

    var getEvents = Fun.constant({ });

    var setGridSize = function (gridInfo, numRows, numColumns) {
      gridInfo.dimensions().set({
        numRows: numRows,
        numColumns: numColumns
      });
    };

    var getApis = function (gridInfo) {
      return {
        setGridSize: function (component, numRows, numCols) {
          setGridSize(gridInfo, numRows, numCols);
        }
      };
    };

    return KeyingType.typical(schema, getRules, getEvents, getApis, Option.some(focusIn));
  }
);