define(
  'ephox.alloy.keying.MatrixType',

  [
    'ephox.alloy.alien.Keys',
    'ephox.alloy.keying.KeyingType',
    'ephox.alloy.keying.KeyingTypes',
    'ephox.alloy.navigation.DomMovement',
    'ephox.alloy.navigation.DomPinpoint',
    'ephox.alloy.navigation.KeyMatch',
    'ephox.alloy.navigation.KeyRules',
    'ephox.alloy.navigation.MatrixNavigation',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.search.SelectorFilter',
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (Keys, KeyingType, KeyingTypes, DomMovement, DomPinpoint, KeyMatch, KeyRules, MatrixNavigation, FieldPresence, FieldSchema, ValueSchema, Arr, Fun, Option, Focus, SelectorFilter, SelectorFind) {
    var schema = [
      FieldSchema.strictObjOf('selectors', [
        FieldSchema.strict('row'),
        FieldSchema.strict('cell')
      ]),

      // Used to determine whether pressing right/down at the end cycles back to the start/top
      FieldSchema.defaulted('cycles', true),
      FieldSchema.defaulted('previousSelector', Option.none),
      FieldSchema.defaulted('execute', KeyingTypes.defaultExecute)
    ];

    var focusIn = function (component, matrixInfo) {
      var focused = matrixInfo.previousSelector()(component).orThunk(function () {
        var selectors = matrixInfo.selectors();
        return SelectorFind.descendant(component.element(), selectors.cell());
      });

      focused.each(function (cell) {
        component.getSystem().triggerFocus(cell, component.element());  
      });
    };

    var execute = function (component, simulatedEvent, matrixInfo) {
      return Focus.search(component.element()).bind(function (focused) {
        return matrixInfo.execute()(component, simulatedEvent, focused);
      });
    };

    var toMatrix = function (rows, matrixInfo) {
      return Arr.map(rows, function (row) {
        return SelectorFilter.descendants(row, matrixInfo.selectors().cell());
      });
    };
  
    var doMove = function (ifCycle, ifMove) {
      return function (element, focused, matrixInfo) {
        var move = matrixInfo.cycles() ? ifCycle : ifMove;
        return SelectorFind.closest(focused, matrixInfo.selectors().row()).bind(function (inRow) {
          var cellsInRow = SelectorFilter.descendants(inRow, matrixInfo.selectors().cell());
        
          return DomPinpoint.findIndex(cellsInRow, focused).bind(function (colIndex) {
            var allRows = SelectorFilter.descendants(element, matrixInfo.selectors().row());
            return DomPinpoint.findIndex(allRows, inRow).bind(function (rowIndex) {
              // Now, make the matrix.
              var matrix = toMatrix(allRows, matrixInfo);
              return move(matrix, rowIndex, colIndex).map(function (next) {
                return next.cell();
              });
            });
          });
        });
      };
    };

    var moveLeft = doMove(MatrixNavigation.cycleLeft, MatrixNavigation.moveLeft);
    var moveRight = doMove(MatrixNavigation.cycleRight, MatrixNavigation.moveRight);
    
    var moveNorth = doMove(MatrixNavigation.cycleUp, MatrixNavigation.moveUp);
    var moveSouth = doMove(MatrixNavigation.cycleDown, MatrixNavigation.moveDown);

    var getRules = Fun.constant([
      KeyRules.rule( KeyMatch.inSet( Keys.LEFT() ), DomMovement.west(moveLeft, moveRight)),
      KeyRules.rule( KeyMatch.inSet( Keys.RIGHT() ), DomMovement.east(moveLeft, moveRight)),
      KeyRules.rule( KeyMatch.inSet( Keys.UP() ), DomMovement.north(moveNorth)),
      KeyRules.rule( KeyMatch.inSet( Keys.DOWN() ), DomMovement.south(moveSouth)),
      KeyRules.rule( KeyMatch.inSet( Keys.SPACE().concat(Keys.ENTER()) ), execute)
    ]);

    var getEvents = Fun.constant({ });

    var getApis = Fun.constant({ });
    return KeyingType.typical(schema, getRules, getEvents, getApis, Option.some(focusIn));
  }
);