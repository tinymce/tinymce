import Keys from '../alien/Keys';
import NoState from '../behaviour/common/NoState';
import KeyingType from './KeyingType';
import KeyingTypes from './KeyingTypes';
import DomMovement from '../navigation/DomMovement';
import DomPinpoint from '../navigation/DomPinpoint';
import KeyMatch from '../navigation/KeyMatch';
import KeyRules from '../navigation/KeyRules';
import MatrixNavigation from '../navigation/MatrixNavigation';
import { FieldSchema } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Focus } from '@ephox/sugar';
import { SelectorFilter } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';

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

var focusIn = function (component, matrixConfig) {
  var focused = matrixConfig.previousSelector()(component).orThunk(function () {
    var selectors = matrixConfig.selectors();
    return SelectorFind.descendant(component.element(), selectors.cell());
  });

  focused.each(function (cell) {
    matrixConfig.focusManager().set(component, cell);
  });
};

var execute = function (component, simulatedEvent, matrixConfig) {
  return Focus.search(component.element()).bind(function (focused) {
    return matrixConfig.execute()(component, simulatedEvent, focused);
  });
};

var toMatrix = function (rows, matrixConfig) {
  return Arr.map(rows, function (row) {
    return SelectorFilter.descendants(row, matrixConfig.selectors().cell());
  });
};

var doMove = function (ifCycle, ifMove) {
  return function (element, focused, matrixConfig) {
    var move = matrixConfig.cycles() ? ifCycle : ifMove;
    return SelectorFind.closest(focused, matrixConfig.selectors().row()).bind(function (inRow) {
      var cellsInRow = SelectorFilter.descendants(inRow, matrixConfig.selectors().cell());

      return DomPinpoint.findIndex(cellsInRow, focused).bind(function (colIndex) {
        var allRows = SelectorFilter.descendants(element, matrixConfig.selectors().row());
        return DomPinpoint.findIndex(allRows, inRow).bind(function (rowIndex) {
          // Now, make the matrix.
          var matrix = toMatrix(allRows, matrixConfig);
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
  KeyRules.rule(KeyMatch.inSet(Keys.LEFT()), DomMovement.west(moveLeft, moveRight)),
  KeyRules.rule(KeyMatch.inSet(Keys.RIGHT()), DomMovement.east(moveLeft, moveRight)),
  KeyRules.rule(KeyMatch.inSet(Keys.UP()), DomMovement.north(moveNorth)),
  KeyRules.rule(KeyMatch.inSet(Keys.DOWN()), DomMovement.south(moveSouth)),
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE().concat(Keys.ENTER())), execute)
]);

var getEvents = Fun.constant({ });

var getApis = Fun.constant({ });

export default <any> KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.some(focusIn));