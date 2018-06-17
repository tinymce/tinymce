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
import { SugarElement } from 'ephox/alloy/alien/TypeDefinitions';
import { FlowConfig } from 'ephox/alloy/keying/KeyingModeTypes';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

const schema = [
  FieldSchema.strict('selector'),
  FieldSchema.defaulted('getInitial', Option.none),
  FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
  FieldSchema.defaulted('executeOnMove', false),
  FieldSchema.defaulted('allowVertical', true)
];

// TODO: Remove dupe.
// TODO: Probably use this for not just execution.
const findCurrent = (component: AlloyComponent, flowConfig: FlowConfig): Option<SugarElement> => {
  return flowConfig.focusManager().get(component).bind((elem) => {
    return SelectorFind.closest(elem, flowConfig.selector());
  });
};

const execute = (component, simulatedEvent, flowConfig) => {
  return findCurrent(component, flowConfig).bind((focused) => {
    return flowConfig.execute()(component, simulatedEvent, focused);
  });
};

const focusIn = (component, flowConfig) => {
  flowConfig.getInitial()(component).or(SelectorFind.descendant(component.element(), flowConfig.selector())).each((first) => {
    flowConfig.focusManager().set(component, first);
  });
};

const moveLeft = (element, focused, info) => {
  return DomNavigation.horizontal(element, info.selector(), focused, -1);
};

const moveRight = (element, focused, info) => {
  return DomNavigation.horizontal(element, info.selector(), focused, +1);
};

const doMove = (movement) => {
  return (component, simulatedEvent, flowConfig) => {
    return movement(component, simulatedEvent, flowConfig).bind(() => {
      return flowConfig.executeOnMove() ? execute(component, simulatedEvent, flowConfig) : Option.some(true);
    });
  };
};

const getRules = (_component, _se, flowConfig, _flowState) => {
  const westMovers = Keys.LEFT().concat(flowConfig.allowVertical() ? Keys.UP() : [ ]);
  const eastMovers = Keys.RIGHT().concat(flowConfig.allowVertical() ? Keys.DOWN() : [ ]);
  return [
    KeyRules.rule(KeyMatch.inSet(westMovers), doMove(DomMovement.west(moveLeft, moveRight))),
    KeyRules.rule(KeyMatch.inSet(eastMovers), doMove(DomMovement.east(moveLeft, moveRight))),
    KeyRules.rule(KeyMatch.inSet(Keys.ENTER()), execute),
    KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), execute)
  ];
};

const getEvents = Fun.constant({ });

const getApis = Fun.constant({ });

export default <any> KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.some(focusIn));