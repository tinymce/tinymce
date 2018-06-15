import { FieldSchema } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import Keys from '../alien/Keys';
import * as KeyingState from '../behaviour/keyboard/KeyingState';
import * as Fields from '../data/Fields';
import * as DomMovement from '../navigation/DomMovement';
import * as DomPinpoint from '../navigation/DomPinpoint';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import * as WrapArrNavigation from '../navigation/WrapArrNavigation';
import * as KeyingType from './KeyingType';
import * as KeyingTypes from './KeyingTypes';

const schema = [
  FieldSchema.strict('selector'),
  FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
  Fields.onKeyboardHandler('onEscape'),
  FieldSchema.defaulted('captureTab', false),
  Fields.initSize()
];

const focusIn = (component, gridConfig, gridState) => {
  SelectorFind.descendant(component.element(), gridConfig.selector()).each((first) => {
    gridConfig.focusManager().set(component, first);
  });
};

const findCurrent = (component, gridConfig) => {
  return gridConfig.focusManager().get(component).bind((elem) => {
    return SelectorFind.closest(elem, gridConfig.selector());
  });
};

const execute = (component, simulatedEvent, gridConfig, gridState) => {
  return findCurrent(component, gridConfig).bind((focused) => {
    return gridConfig.execute()(component, simulatedEvent, focused);
  });
};

const doMove = (cycle) => {
  return (element, focused, gridConfig, gridState) => {
    return DomPinpoint.locateVisible(element, focused, gridConfig.selector()).bind((identified) => {
      return cycle(
        identified.candidates(),
        identified.index(),
        gridState.getNumRows().getOr(gridConfig.initSize().numRows()),
        gridState.getNumColumns().getOr(gridConfig.initSize().numColumns())
      );
    });
  };
};

const handleTab = (component, simulatedEvent, gridConfig, gridState) => {
  return gridConfig.captureTab() ? Option.some(true) : Option.none();
};

const doEscape = (component, simulatedEvent, gridConfig, gridState) => {
  return gridConfig.onEscape()(component, simulatedEvent);
};

const moveLeft = doMove(WrapArrNavigation.cycleLeft);
const moveRight = doMove(WrapArrNavigation.cycleRight);

const moveNorth = doMove(WrapArrNavigation.cycleUp);
const moveSouth = doMove(WrapArrNavigation.cycleDown);

const getRules = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.LEFT()), DomMovement.west(moveLeft, moveRight)),
  KeyRules.rule(KeyMatch.inSet(Keys.RIGHT()), DomMovement.east(moveLeft, moveRight)),
  KeyRules.rule(KeyMatch.inSet(Keys.UP()), DomMovement.north(moveNorth)),
  KeyRules.rule(KeyMatch.inSet(Keys.DOWN()), DomMovement.south(moveSouth)),
  KeyRules.rule(KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB()) ]), handleTab),
  KeyRules.rule(KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.TAB()) ]), handleTab),
  KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE()), doEscape),

  KeyRules.rule(KeyMatch.inSet(Keys.SPACE().concat(Keys.ENTER())), execute)
]);

const getEvents = Fun.constant({ });

const getApis = {};

export default <any> KeyingType.typical(schema, KeyingState.flatgrid, getRules, getEvents, getApis, Option.some(focusIn));