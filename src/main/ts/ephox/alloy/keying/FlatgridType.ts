import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';
import { SelectorFind, Element } from '@ephox/sugar';

import * as Keys from '../alien/Keys';
import * as KeyingState from '../behaviour/keyboard/KeyingState';
import * as Fields from '../data/Fields';
import * as DomMovement from '../navigation/DomMovement';
import * as DomPinpoint from '../navigation/DomPinpoint';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import * as WrapArrNavigation from '../navigation/WrapArrNavigation';
import * as KeyingType from './KeyingType';
import * as KeyingTypes from './KeyingTypes';
import { FlatgridConfig, FlatgridState, KeyRuleHandler } from '../keying/KeyingModeTypes';

import { AlloyComponent } from '../api/component/ComponentApi';
import { NativeSimulatedEvent } from '../events/SimulatedEvent';

// NB: Tsc requires AlloyEventHandler to be imported here.
import { AlloyEventHandler } from '../api/events/AlloyEvents';

const schema = [
  FieldSchema.strict('selector'),
  FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
  Fields.onKeyboardHandler('onEscape'),
  FieldSchema.defaulted('captureTab', false),
  Fields.initSize()
];

const focusIn = (component: AlloyComponent, gridConfig: FlatgridConfig, gridState: FlatgridState): void => {
  SelectorFind.descendant(component.element(), gridConfig.selector).each((first: Element) => {
    gridConfig.focusManager.set(component, first);
  });
};

const findCurrent = (component: AlloyComponent, gridConfig: FlatgridConfig): Option<Element> => {
  return gridConfig.focusManager.get(component).bind((elem) => {
    return SelectorFind.closest(elem, gridConfig.selector);
  });
};

const execute = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent, gridConfig: FlatgridConfig, gridState: FlatgridState): Option<boolean> => {
  return findCurrent(component, gridConfig).bind((focused) => {
    return gridConfig.execute(component, simulatedEvent, focused);
  });
};

const doMove = (cycle): DomMovement.ElementMover<FlatgridConfig, FlatgridState> => {
  return (element, focused, gridConfig, gridState) => {
    return DomPinpoint.locateVisible(element, focused, gridConfig.selector).bind((identified) => {
      return cycle(
        identified.candidates(),
        identified.index(),
        gridState.getNumRows().getOr(gridConfig.initSize.numRows),
        gridState.getNumColumns().getOr(gridConfig.initSize.numColumns)
      );
    });
  };
};

const handleTab: KeyRuleHandler<FlatgridConfig, FlatgridState> = (component, simulatedEvent, gridConfig, gridState) => {
  return gridConfig.captureTab ? Option.some(true) : Option.none();
};

const doEscape: KeyRuleHandler<FlatgridConfig, FlatgridState>  = (component, simulatedEvent, gridConfig, gridState) => {
  return gridConfig.onEscape(component, simulatedEvent);
};

const moveLeft = doMove(WrapArrNavigation.cycleLeft);
const moveRight = doMove(WrapArrNavigation.cycleRight);

const moveNorth = doMove(WrapArrNavigation.cycleUp);
const moveSouth = doMove(WrapArrNavigation.cycleDown);

const getKeydownRules: () => Array<KeyRules.KeyRule<FlatgridConfig, FlatgridState>> = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.LEFT()), DomMovement.west<FlatgridConfig, FlatgridState>(moveLeft, moveRight)),
  KeyRules.rule(KeyMatch.inSet(Keys.RIGHT()), DomMovement.east(moveLeft, moveRight)),
  KeyRules.rule(KeyMatch.inSet(Keys.UP()), DomMovement.north(moveNorth)),
  KeyRules.rule(KeyMatch.inSet(Keys.DOWN()), DomMovement.south(moveSouth)),
  KeyRules.rule(KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB()) ]), handleTab),
  KeyRules.rule(KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.TAB()) ]), handleTab),
  KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE()), doEscape),

  // Probably should make whether space is used configurable
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE().concat(Keys.ENTER())), execute)
]);

const getKeyupRules: () => Array<KeyRules.KeyRule<FlatgridConfig, FlatgridState>> = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), KeyingTypes.stopEventForFirefox)
])

export default KeyingType.typical(schema, KeyingState.flatgrid, getKeydownRules, getKeyupRules, () => Option.some(focusIn));