import { FieldSchema } from '@ephox/boulder';
import { Fun, Optional } from '@ephox/katamari';
import { SelectorFind, SugarElement } from '@ephox/sugar';

import * as Keys from '../alien/Keys';
import { AlloyComponent } from '../api/component/ComponentApi';
import { NoState, Stateless } from '../behaviour/common/BehaviourState';
import * as Fields from '../data/Fields';
import { NativeSimulatedEvent } from '../events/SimulatedEvent';
import * as DomMovement from '../navigation/DomMovement';
import * as DomNavigation from '../navigation/DomNavigation';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import { FlowConfig, KeyRuleHandler } from './KeyingModeTypes';
import * as KeyingType from './KeyingType';
import * as KeyingTypes from './KeyingTypes';

const schema = [
  FieldSchema.required('selector'),
  FieldSchema.defaulted('getInitial', Optional.none),
  FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
  Fields.onKeyboardHandler('onEscape'),
  FieldSchema.defaulted('executeOnMove', false),
  FieldSchema.defaulted('allowVertical', true),
  FieldSchema.defaulted('allowHorizontal', true),
  FieldSchema.defaulted('cycles', true)
];

// TODO: Remove dupe.
// TODO: Probably use this for not just execution.
const findCurrent = (component: AlloyComponent, flowConfig: FlowConfig): Optional<SugarElement<HTMLElement>> =>
  flowConfig.focusManager.get(component).bind((elem) => SelectorFind.closest(elem, flowConfig.selector));

const execute = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent, flowConfig: FlowConfig): Optional<boolean> =>
  findCurrent(component, flowConfig).bind((focused) => flowConfig.execute(component, simulatedEvent, focused));

const focusIn = (component: AlloyComponent, flowConfig: FlowConfig, _state: Stateless): void => {
  flowConfig.getInitial(component).orThunk(
    () => SelectorFind.descendant<HTMLElement>(component.element, flowConfig.selector)
  ).each((first) => {
    flowConfig.focusManager.set(component, first);
  });
};

const moveLeft = (element: SugarElement<HTMLElement>, focused: SugarElement<HTMLElement>, info: FlowConfig): Optional<SugarElement<HTMLElement>> =>
  (info.cycles ? DomNavigation.horizontal : DomNavigation.horizontalWithoutCycles)(element, info.selector, focused, -1);

const moveRight = (element: SugarElement<HTMLElement>, focused: SugarElement<HTMLElement>, info: FlowConfig): Optional<SugarElement<HTMLElement>> =>
  (info.cycles ? DomNavigation.horizontal : DomNavigation.horizontalWithoutCycles)(element, info.selector, focused, +1);

const doMove = (movement: KeyRuleHandler<FlowConfig, Stateless>): KeyRuleHandler<FlowConfig, Stateless> =>
  (component, simulatedEvent, flowConfig, flowState) =>
    movement(component, simulatedEvent, flowConfig, flowState).bind(
      () =>
        flowConfig.executeOnMove ?
          execute(component, simulatedEvent, flowConfig) :
          Optional.some<boolean>(true)
    );

const doEscape: KeyRuleHandler<FlowConfig, Stateless> = (component, simulatedEvent, flowConfig) =>
  flowConfig.onEscape(component, simulatedEvent);

const getKeydownRules = (
  _component: AlloyComponent,
  _se: NativeSimulatedEvent,
  flowConfig: FlowConfig,
  _flowState: Stateless
): Array<KeyRules.KeyRule<FlowConfig, Stateless>> => {
  const westMovers = [ ...flowConfig.allowHorizontal ? Keys.LEFT : [] ].concat(flowConfig.allowVertical ? Keys.UP : [ ]);
  const eastMovers = [ ...flowConfig.allowHorizontal ? Keys.RIGHT : [] ].concat(flowConfig.allowVertical ? Keys.DOWN : [ ]);
  return [
    KeyRules.rule(KeyMatch.inSet(westMovers), doMove(DomMovement.west(moveLeft, moveRight))),
    KeyRules.rule(KeyMatch.inSet(eastMovers), doMove(DomMovement.east(moveLeft, moveRight))),
    KeyRules.rule(KeyMatch.inSet(Keys.ENTER), execute),
    KeyRules.rule(KeyMatch.inSet(Keys.SPACE), execute)
  ];
};

const getKeyupRules: () => Array<KeyRules.KeyRule<FlowConfig, Stateless>> = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE), KeyingTypes.stopEventForFirefox),
  KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE), doEscape)
]);

export default KeyingType.typical(schema, NoState.init, getKeydownRules, getKeyupRules, () => Optional.some(focusIn));
