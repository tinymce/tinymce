import Keys from '../alien/Keys';
import NoState from '../behaviour/common/NoState';
import KeyingType from './KeyingType';
import KeyingTypes from './KeyingTypes';
import DomMovement from '../navigation/DomMovement';
import DomNavigation from '../navigation/DomNavigation';
import KeyMatch from '../navigation/KeyMatch';
import KeyRules from '../navigation/KeyRules';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Focus } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';

var schema = [
  FieldSchema.strict('selector'),
  FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
  FieldSchema.defaulted('moveOnTab', false)
];

var execute = function (component, simulatedEvent, menuConfig) {
  return menuConfig.focusManager().get(component).bind(function (focused) {
    return menuConfig.execute()(component, simulatedEvent, focused);
  });
};

var focusIn = function (component, menuConfig, simulatedEvent) {
  // Maybe keep selection if it was there before
  SelectorFind.descendant(component.element(), menuConfig.selector()).each(function (first) {
    menuConfig.focusManager().set(component, first);
  });
};

var moveUp = function (element, focused, info) {
  return DomNavigation.horizontal(element, info.selector(), focused, -1);
};

var moveDown = function (element, focused, info) {
  return DomNavigation.horizontal(element, info.selector(), focused, +1);
};

var fireShiftTab = function (component, simulatedEvent, menuConfig) {
  return menuConfig.moveOnTab() ? DomMovement.move(moveUp)(component, simulatedEvent, menuConfig) : Option.none();
};

var fireTab = function (component, simulatedEvent, menuConfig) {
  return menuConfig.moveOnTab() ? DomMovement.move(moveDown)(component, simulatedEvent, menuConfig) : Option.none();
};

var getRules = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.UP()), DomMovement.move(moveUp)),
  KeyRules.rule(KeyMatch.inSet(Keys.DOWN()), DomMovement.move(moveDown)),
  KeyRules.rule(KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB()) ]), fireShiftTab),
  KeyRules.rule(KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.TAB()) ]), fireTab),
  KeyRules.rule(KeyMatch.inSet(Keys.ENTER()), execute),
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), execute)
]);

var getEvents = Fun.constant({ });

var getApis = Fun.constant({ });

export default <any> KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.some(focusIn));