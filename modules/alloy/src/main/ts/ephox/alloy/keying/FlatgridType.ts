import { FieldSchema } from '@ephox/boulder';
import { Fun, Optional } from '@ephox/katamari';
import { SelectorFind, SugarElement } from '@ephox/sugar';

import * as Keys from '../alien/Keys';
import { AlloyComponent } from '../api/component/ComponentApi';
import * as KeyingState from '../behaviour/keyboard/KeyingState';
import * as Fields from '../data/Fields';
import { NativeSimulatedEvent } from '../events/SimulatedEvent';
import * as DomMovement from '../navigation/DomMovement';
import * as DomPinpoint from '../navigation/DomPinpoint';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import * as WrapArrNavigation from '../navigation/WrapArrNavigation';
import { FlatgridConfig, FlatgridState, KeyRuleHandler } from './KeyingModeTypes';
import * as KeyingType from './KeyingType';
import * as KeyingTypes from './KeyingTypes';

const schema = [
  FieldSchema.required('selector'),
  FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
  Fields.onKeyboardHandler('onEscape'),
  FieldSchema.defaulted('captureTab', false),
  Fields.initSize()
];

const focusIn = (component: AlloyComponent, gridConfig: FlatgridConfig, _gridState: FlatgridState): void => {
  SelectorFind.descendant<HTMLElement>(component.element, gridConfig.selector).each((first) => {
    gridConfig.focusManager.set(component, first);
  });
};

const findCurrent = (component: AlloyComponent, gridConfig: FlatgridConfig): Optional<SugarElement<HTMLElement>> =>
  gridConfig.focusManager.get(component).bind((elem) => SelectorFind.closest(elem, gridConfig.selector));

const execute = (
  component: AlloyComponent,
  simulatedEvent: NativeSimulatedEvent,
  gridConfig: FlatgridConfig,
  _gridState: FlatgridState
): Optional<boolean> =>
  findCurrent(component, gridConfig)
    .bind((focused) => gridConfig.execute(component, simulatedEvent, focused));

const doMove = (
  cycle: WrapArrNavigation.ArrNavigationFunc<SugarElement<HTMLElement>>
): DomMovement.ElementMover<FlatgridConfig, FlatgridState> =>
  (element, focused, gridConfig, gridState) =>
    DomPinpoint.locateVisible(element, focused, gridConfig.selector)
      .bind((identified) => cycle(
        identified.candidates,
        identified.index,
        gridState.getNumRows().getOr(gridConfig.initSize.numRows),
        gridState.getNumColumns().getOr(gridConfig.initSize.numColumns)
      ));

const handleTab: KeyRuleHandler<FlatgridConfig, FlatgridState> = (_component, _simulatedEvent, gridConfig) =>
  gridConfig.captureTab ? Optional.some<boolean>(true) : Optional.none();

const doEscape: KeyRuleHandler<FlatgridConfig, FlatgridState> = (component, simulatedEvent, gridConfig) =>
  gridConfig.onEscape(component, simulatedEvent);

const moveLeft = doMove(WrapArrNavigation.cycleLeft);
const moveRight = doMove(WrapArrNavigation.cycleRight);

const moveNorth = doMove(WrapArrNavigation.cycleUp);
const moveSouth = doMove(WrapArrNavigation.cycleDown);

const getKeydownRules: () => Array<KeyRules.KeyRule<FlatgridConfig, FlatgridState>> = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.LEFT), DomMovement.west<FlatgridConfig, FlatgridState>(moveLeft, moveRight)),
  KeyRules.rule(KeyMatch.inSet(Keys.RIGHT), DomMovement.east(moveLeft, moveRight)),
  KeyRules.rule(KeyMatch.inSet(Keys.UP), DomMovement.north(moveNorth)),
  KeyRules.rule(KeyMatch.inSet(Keys.DOWN), DomMovement.south(moveSouth)),
  KeyRules.rule(KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB) ]), handleTab),
  KeyRules.rule(KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.TAB) ]), handleTab),

  // Probably should make whether space is used configurable
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE.concat(Keys.ENTER)), execute)
]);

const getKeyupRules: () => Array<KeyRules.KeyRule<FlatgridConfig, FlatgridState>> = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE), doEscape),
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE), KeyingTypes.stopEventForFirefox)
]);

export default KeyingType.typical(
  schema,
  KeyingState.flatgrid,
  getKeydownRules,
  getKeyupRules,
  () => Optional.some(focusIn)
);
