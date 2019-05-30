import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';
import { SelectorFind, Element } from '@ephox/sugar';

import * as Keys from '../alien/Keys';
import * as Fields from '../data/Fields';
import { NoState, Stateless } from '../behaviour/common/BehaviourState';
import * as DomMovement from '../navigation/DomMovement';
import * as DomNavigation from '../navigation/DomNavigation';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import * as KeyingType from './KeyingType';
import * as KeyingTypes from './KeyingTypes';

import { FlowConfig, KeyRuleHandler } from '../keying/KeyingModeTypes';

import { AlloyComponent } from '../api/component/ComponentApi';
import { NativeSimulatedEvent } from '../events/SimulatedEvent';

// NB: Tsc requires AlloyEventHandler to be imported here.
import { AlloyEventHandler } from '../api/events/AlloyEvents';

const schema = [
  FieldSchema.strict('selector'),
  FieldSchema.defaulted('getInitial', Option.none),
  FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
  Fields.onKeyboardHandler('onEscape'),
  FieldSchema.defaulted('executeOnMove', false),
  FieldSchema.defaulted('allowVertical', true)
];

// TODO: Remove dupe.
// TODO: Probably use this for not just execution.
const findCurrent = (component: AlloyComponent, flowConfig: FlowConfig): Option<Element> => {
  return flowConfig.focusManager.get(component).bind((elem) => {
    return SelectorFind.closest(elem, flowConfig.selector);
  });
};

const execute = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent, flowConfig: FlowConfig): Option<boolean> => {
  return findCurrent(component, flowConfig).bind((focused) => {
    return flowConfig.execute(component, simulatedEvent, focused);
  });
};

const focusIn = (component: AlloyComponent, flowConfig: FlowConfig): void => {
  flowConfig.getInitial(component).orThunk(
    () => SelectorFind.descendant(component.element(), flowConfig.selector)
  ).each((first) => {
    flowConfig.focusManager.set(component, first);
  });
};

const moveLeft = (element: Element, focused: Element, info: FlowConfig): Option<Element> => {
  return DomNavigation.horizontal(element, info.selector, focused, -1);
};

const moveRight = (element: Element, focused: Element, info: FlowConfig): Option<Element> => {
  return DomNavigation.horizontal(element, info.selector, focused, +1);
};

const doMove = (movement: KeyRuleHandler<FlowConfig, Stateless>): KeyRuleHandler<FlowConfig, Stateless> => {
  return (component, simulatedEvent, flowConfig) => {
    return movement(component, simulatedEvent, flowConfig).bind(() => {
      return flowConfig.executeOnMove ? execute(component, simulatedEvent, flowConfig) : Option.some(true);
    });
  };
};

const doEscape: KeyRuleHandler<FlowConfig, Stateless>  = (component, simulatedEvent, flowConfig, _flowState) => {
  return flowConfig.onEscape(component, simulatedEvent);
};

const getKeydownRules = (_component, _se, flowConfig: FlowConfig, _flowState): Array<KeyRules.KeyRule<FlowConfig, Stateless>> => {
  const westMovers = Keys.LEFT().concat(flowConfig.allowVertical ? Keys.UP() : [ ]);
  const eastMovers = Keys.RIGHT().concat(flowConfig.allowVertical ? Keys.DOWN() : [ ]);
  return [
    KeyRules.rule(KeyMatch.inSet(westMovers), doMove(DomMovement.west(moveLeft, moveRight))),
    KeyRules.rule(KeyMatch.inSet(eastMovers), doMove(DomMovement.east(moveLeft, moveRight))),
    KeyRules.rule(KeyMatch.inSet(Keys.ENTER()), execute),
    KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), execute),
    KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE()), doEscape)
  ];
};

const getKeyupRules: () => Array<KeyRules.KeyRule<FlowConfig, Stateless>> = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), KeyingTypes.stopEventForFirefox)
])

export default KeyingType.typical(schema, NoState.init, getKeydownRules, getKeyupRules, () => Option.some(focusIn));