define(
  'ephox.alloy.keying.FlatgridType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.keying.KeyingTypes',
    'ephox.alloy.navigation.DomMovement',
    'ephox.alloy.navigation.DomPinpoint',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.alloy.navigation.WrapArrNavigation',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Focus',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Keys, SystemEvents, EventHandler, KeyingType, KeyingTypes, DomMovement, DomPinpoint, KeyMatch, KeyRules, WrapArrNavigation, FieldSchema, Objects, Cell, Focus, SelectorFind) {
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
      return Focus.search(component.element(), gridInfo.selector()).map(function (focused) {
        gridInfo.execute()(component, simulatedEvent, focused);
        return true;
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

    var getRules = function (_) {
      return [
        KeyRules.rule( KeyMatch.inSet( Keys.LEFT() ), DomMovement.west(moveLeft, moveRight)),
        KeyRules.rule( KeyMatch.inSet( Keys.RIGHT() ), DomMovement.east(moveLeft, moveRight)),
        KeyRules.rule( KeyMatch.inSet( Keys.UP() ), DomMovement.north(moveNorth)),
        KeyRules.rule( KeyMatch.inSet( Keys.DOWN() ), DomMovement.south(moveSouth)),
        KeyRules.rule( KeyMatch.inSet( Keys.SPACE().concat(Keys.ENTER()) ), execute)
      ];
    };

    var getEvents = function (gridInfo) {
      return Objects.wrapAll([
        { 
          key: SystemEvents.focus(),
          value: EventHandler.nu({
            run: function (component) {
              // TODO: Do we want to implement a 'recent' again?
              // Find a target inside the component
              focusIn(component, gridInfo);
            }
          })
        }
      ]);
    };

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

    return KeyingType(schema, getRules, getEvents, getApis);
  }
);