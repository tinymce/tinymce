import { FieldSchema } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import Keys from '../alien/Keys';
import { NoState } from '../behaviour/common/BehaviourState';
import * as DomMovement from '../navigation/DomMovement';
import * as DomNavigation from '../navigation/DomNavigation';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import * as KeyingType from './KeyingType';
import * as KeyingTypes from './KeyingTypes';

const schema = [
  FieldSchema.strict('selector'),
  FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
  FieldSchema.defaulted('moveOnTab', false)
];

const execute = (component, simulatedEvent, menuConfig) => {
  return menuConfig.focusManager().get(component).bind((focused) => {
    return menuConfig.execute()(component, simulatedEvent, focused);
  });
};

const focusIn = (component, menuConfig, simulatedEvent) => {
  // Maybe keep selection if it was there before
  SelectorFind.descendant(component.element(), menuConfig.selector()).each((first) => {
    menuConfig.focusManager().set(component, first);
  });
};

const moveUp = (element, focused, info) => {
  return DomNavigation.horizontal(element, info.selector(), focused, -1);
};

const moveDown = (element, focused, info) => {
  return DomNavigation.horizontal(element, info.selector(), focused, +1);
};

const fireShiftTab = (component, simulatedEvent, menuConfig) => {
  return menuConfig.moveOnTab() ? DomMovement.move(moveUp)(component, simulatedEvent, menuConfig) : Option.none();
};

const fireTab = (component, simulatedEvent, menuConfig) => {
  return menuConfig.moveOnTab() ? DomMovement.move(moveDown)(component, simulatedEvent, menuConfig) : Option.none();
};

const getRules = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.UP()), DomMovement.move(moveUp)),
  KeyRules.rule(KeyMatch.inSet(Keys.DOWN()), DomMovement.move(moveDown)),
  KeyRules.rule(KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB()) ]), fireShiftTab),
  KeyRules.rule(KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.TAB()) ]), fireTab),
  KeyRules.rule(KeyMatch.inSet(Keys.ENTER()), execute),
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), execute)
]);

const getEvents = Fun.constant({ });

const getApis = Fun.constant({ });

export default <any> KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.some(focusIn));