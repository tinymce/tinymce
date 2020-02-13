import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Arr, Fun, Option } from '@ephox/katamari';
import { Element, Focus, SelectorFilter, SelectorFind } from '@ephox/sugar';

import * as Keys from '../alien/Keys';
import { AlloyComponent } from '../api/component/ComponentApi';
import { NoState, Stateless } from '../behaviour/common/BehaviourState';
import * as DomMovement from '../navigation/DomMovement';
import * as DomPinpoint from '../navigation/DomPinpoint';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import * as MatrixNavigation from '../navigation/MatrixNavigation';
import { KeyRuleHandler, MatrixConfig } from './KeyingModeTypes';
import * as KeyingType from './KeyingType';
import * as KeyingTypes from './KeyingTypes';

const schema: FieldProcessorAdt[] = [
  FieldSchema.strictObjOf('selectors', [
    FieldSchema.strict('row'),
    FieldSchema.strict('cell')
  ]),

  // Used to determine whether pressing right/down at the end cycles back to the start/top
  FieldSchema.defaulted('cycles', true),
  FieldSchema.defaulted('previousSelector', Option.none),
  FieldSchema.defaulted('execute', KeyingTypes.defaultExecute)
];

const focusIn = (component: AlloyComponent, matrixConfig: MatrixConfig, state: Stateless): void => {
  const focused = matrixConfig.previousSelector(component).orThunk(() => {
    const selectors = matrixConfig.selectors;
    return SelectorFind.descendant(component.element(), selectors.cell);
  });

  focused.each((cell) => {
    matrixConfig.focusManager.set(component, cell);
  });
};

const execute: KeyRuleHandler<MatrixConfig, Stateless> = (component, simulatedEvent, matrixConfig) => {
  return Focus.search(component.element()).bind((focused) => {
    return matrixConfig.execute(component, simulatedEvent, focused);
  });
};

const toMatrix = (rows: Element[], matrixConfig: MatrixConfig): Element[][] => {
  return Arr.map(rows, (row) => {
    return SelectorFilter.descendants(row, matrixConfig.selectors.cell);
  });
};

const doMove = (ifCycle: MatrixNavigation.MatrixNavigationFunc<Element>, ifMove: MatrixNavigation.MatrixNavigationFunc<Element>): DomMovement.ElementMover<MatrixConfig, Stateless> => {
  return (element, focused, matrixConfig) => {
    const move = matrixConfig.cycles ? ifCycle : ifMove;
    return SelectorFind.closest(focused, matrixConfig.selectors.row).bind((inRow) => {
      const cellsInRow = SelectorFilter.descendants(inRow, matrixConfig.selectors.cell);

      return DomPinpoint.findIndex(cellsInRow, focused).bind((colIndex) => {
        const allRows = SelectorFilter.descendants(element, matrixConfig.selectors.row);
        return DomPinpoint.findIndex(allRows, inRow).bind((rowIndex) => {
          // Now, make the matrix.
          const matrix = toMatrix(allRows, matrixConfig);
          return move(matrix, rowIndex, colIndex).map((next) => {
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

const getKeydownRules: () => Array<KeyRules.KeyRule<MatrixConfig, Stateless>> = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.LEFT()), DomMovement.west(moveLeft, moveRight)),
  KeyRules.rule(KeyMatch.inSet(Keys.RIGHT()), DomMovement.east(moveLeft, moveRight)),
  KeyRules.rule(KeyMatch.inSet(Keys.UP()), DomMovement.north(moveNorth)),
  KeyRules.rule(KeyMatch.inSet(Keys.DOWN()), DomMovement.south(moveSouth)),
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE().concat(Keys.ENTER())), execute)
]);

const getKeyupRules: () => Array<KeyRules.KeyRule<MatrixConfig, Stateless>> = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), KeyingTypes.stopEventForFirefox)
]);

export default KeyingType.typical(schema, NoState.init, getKeydownRules, getKeyupRules, () => Option.some(focusIn));
