import { FieldSchema } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import Keys from '../alien/Keys';
import * as NoState from '../behaviour/common/NoState';
import DomMovement from '../navigation/DomMovement';
import DomNavigation from '../navigation/DomNavigation';
import KeyMatch from '../navigation/KeyMatch';
import KeyRules from '../navigation/KeyRules';
import * as KeyingType from './KeyingType';
import * as KeyingTypes from './KeyingTypes';

const schema = [
  FieldSchema.strict('selector'),
  FieldSchema.defaulted('getInitial', Option.none),
  FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
  FieldSchema.defaulted('executeOnMove', false)
];

// TODO: Remove dupe.
const findCurrent = function (component, flowConfig) {
  return flowConfig.focusManager().get(component).bind(function (elem) {
    return SelectorFind.closest(elem, flowConfig.selector());
  });
};

const execute = function (component, simulatedEvent, flowConfig) {
  return findCurrent(component, flowConfig).bind(function (focused) {
    return flowConfig.execute()(component, simulatedEvent, focused);
  });
};

const focusIn = function (component, flowConfig) {
  flowConfig.getInitial()(component).or(SelectorFind.descendant(component.element(), flowConfig.selector())).each(function (first) {
    flowConfig.focusManager().set(component, first);
  });
};

const moveLeft = function (element, focused, info) {
  return DomNavigation.horizontal(element, info.selector(), focused, -1);
};

const moveRight = function (element, focused, info) {
  return DomNavigation.horizontal(element, info.selector(), focused, +1);
};

const doMove = function (movement) {
  return function (component, simulatedEvent, flowConfig) {
    return movement(component, simulatedEvent, flowConfig).bind(function () {
      return flowConfig.executeOnMove() ? execute(component, simulatedEvent, flowConfig) : Option.some(true);
    });
  };
};

const getRules = function (_) {
  return [
    KeyRules.rule(KeyMatch.inSet(Keys.LEFT().concat(Keys.UP())), doMove(DomMovement.west(moveLeft, moveRight))),
    KeyRules.rule(KeyMatch.inSet(Keys.RIGHT().concat(Keys.DOWN())), doMove(DomMovement.east(moveLeft, moveRight))),
    KeyRules.rule(KeyMatch.inSet(Keys.ENTER()), execute),
    KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), execute)
  ];
};

const getEvents = Fun.constant({ });

const getApis = Fun.constant({ });

export default <any> KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.some(focusIn));