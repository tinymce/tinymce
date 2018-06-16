import { FieldSchema } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';

import * as EditableFields from '../alien/EditableFields';
import Keys from '../alien/Keys';
import { NoState } from '../behaviour/common/BehaviourState';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import * as KeyingType from './KeyingType';
import * as KeyingTypes from './KeyingTypes';

const schema = [
  FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
  FieldSchema.defaulted('useSpace', false),
  FieldSchema.defaulted('useEnter', true),
  FieldSchema.defaulted('useControlEnter', false),
  FieldSchema.defaulted('useDown', false)
];

const execute = (component, simulatedEvent, executeConfig, executeState) => {
  return executeConfig.execute()(component, simulatedEvent, component.element());
};

const getRules = (component, simulatedEvent, executeConfig, executeState) => {
  const spaceExec = executeConfig.useSpace() && !EditableFields.inside(component.element()) ? Keys.SPACE() : [ ];
  const enterExec = executeConfig.useEnter() ? Keys.ENTER() : [ ];
  const downExec = executeConfig.useDown() ? Keys.DOWN() : [ ];
  const execKeys = spaceExec.concat(enterExec).concat(downExec);

  return [
    KeyRules.rule(KeyMatch.inSet(execKeys), execute)
  ].concat(executeConfig.useControlEnter() ? [
    KeyRules.rule(KeyMatch.and([ KeyMatch.isControl, KeyMatch.inSet(Keys.ENTER()) ]), execute)
  ] : [ ]);
};

const getEvents = Fun.constant({ });
const getApis = Fun.constant({ });

export default <any> KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.none());