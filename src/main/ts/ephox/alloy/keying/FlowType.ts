import EditableFields from '../alien/EditableFields';
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
  FieldSchema.defaulted('getInitial', Option.none),
  FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
  FieldSchema.defaulted('executeOnMove', false)
];

// TODO: Remove dupe.
var findCurrent = function (component, flowConfig) {
  return flowConfig.focusManager().get(component).bind(function (elem) {
    return SelectorFind.closest(elem, flowConfig.selector());
  });
};

var execute = function (component, simulatedEvent, flowConfig) {
  return findCurrent(component, flowConfig).bind(function (focused) {
    return flowConfig.execute()(component, simulatedEvent, focused);
  });
};

var focusIn = function (component, flowConfig) {
  flowConfig.getInitial()(component).or(SelectorFind.descendant(component.element(), flowConfig.selector())).each(function (first) {
    flowConfig.focusManager().set(component, first);
  });
};

var moveLeft = function (element, focused, info) {
  return DomNavigation.horizontal(element, info.selector(), focused, -1);
};

var moveRight = function (element, focused, info) {
  return DomNavigation.horizontal(element, info.selector(), focused, +1);
};

var doMove = function (movement) {
  return function (component, simulatedEvent, flowConfig) {
    return movement(component, simulatedEvent, flowConfig).bind(function () {
      return flowConfig.executeOnMove() ? execute(component, simulatedEvent, flowConfig) : Option.some(true);
    });
  };
};

var getRules = function (_) {
  return [
    KeyRules.rule(KeyMatch.inSet(Keys.LEFT().concat(Keys.UP())), doMove(DomMovement.west(moveLeft, moveRight))),
    KeyRules.rule(KeyMatch.inSet(Keys.RIGHT().concat(Keys.DOWN())), doMove(DomMovement.east(moveLeft, moveRight))),
    KeyRules.rule(KeyMatch.inSet(Keys.ENTER()), execute),
    KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), execute)
  ];
};

var getEvents = Fun.constant({ });

var getApis = Fun.constant({ });

export default <any> KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.some(focusIn));