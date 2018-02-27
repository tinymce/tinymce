import { FieldSchema } from '@ephox/boulder';
import { Arr, Fun, Option } from '@ephox/katamari';
import { Focus, SelectorFilter, SelectorFind } from '@ephox/sugar';

import Keys from '../alien/Keys';
import * as NoState from '../behaviour/common/NoState';
import * as DomMovement from '../navigation/DomMovement';
import * as DomPinpoint from '../navigation/DomPinpoint';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import * as MatrixNavigation from '../navigation/MatrixNavigation';
import * as KeyingType from './KeyingType';
import * as KeyingTypes from './KeyingTypes';

const schema = [
  FieldSchema.strictObjOf('selectors', [
    FieldSchema.strict('row'),
    FieldSchema.strict('cell')
  ]),

  // Used to determine whether pressing right/down at the end cycles back to the start/top
  FieldSchema.defaulted('cycles', true),
  FieldSchema.defaulted('previousSelector', Option.none),
  FieldSchema.defaulted('execute', KeyingTypes.defaultExecute)
];

const focusIn = function (component, matrixConfig) {
  const focused = matrixConfig.previousSelector()(component).orThunk(function () {
    const selectors = matrixConfig.selectors();
    return SelectorFind.descendant(component.element(), selectors.cell());
  });

  focused.each(function (cell) {
    matrixConfig.focusManager().set(component, cell);
  });
};

const execute = function (component, simulatedEvent, matrixConfig) {
  return Focus.search(component.element()).bind(function (focused) {
    return matrixConfig.execute()(component, simulatedEvent, focused);
  });
};

const toMatrix = function (rows, matrixConfig) {
  return Arr.map(rows, function (row) {
    return SelectorFilter.descendants(row, matrixConfig.selectors().cell());
  });
};

const doMove = function (ifCycle, ifMove) {
  return function (element, focused, matrixConfig) {
    const move = matrixConfig.cycles() ? ifCycle : ifMove;
    return SelectorFind.closest(focused, matrixConfig.selectors().row()).bind(function (inRow) {
      const cellsInRow = SelectorFilter.descendants(inRow, matrixConfig.selectors().cell());

      return DomPinpoint.findIndex(cellsInRow, focused).bind(function (colIndex) {
        const allRows = SelectorFilter.descendants(element, matrixConfig.selectors().row());
        return DomPinpoint.findIndex(allRows, inRow).bind(function (rowIndex) {
          // Now, make the matrix.
          const matrix = toMatrix(allRows, matrixConfig);
          return move(matrix, rowIndex, colIndex).map(function (next) {
            return next.cell();
          });
        });
      });
    });
  };
};

const moveLeft = doMove(MatrixNavigation.cycleLeft, MatrixNavigation.moveLeft);
const moveRight = doMove(MatrixNavigation.cycleRight, MatrixNavigation.moveRight);

const moveNorth = doMove(MatrixNavigation.cycleUp, MatrixNavigation.moveUp);
const moveSouth = doMove(MatrixNavigation.cycleDown, MatrixNavigation.moveDown);

const getRules = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.LEFT()), DomMovement.west(moveLeft, moveRight)),
  KeyRules.rule(KeyMatch.inSet(Keys.RIGHT()), DomMovement.east(moveLeft, moveRight)),
  KeyRules.rule(KeyMatch.inSet(Keys.UP()), DomMovement.north(moveNorth)),
  KeyRules.rule(KeyMatch.inSet(Keys.DOWN()), DomMovement.south(moveSouth)),
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE().concat(Keys.ENTER())), execute)
]);

const getEvents = Fun.constant({ });

const getApis = Fun.constant({ });

export default <any> KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.some(focusIn));