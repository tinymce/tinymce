import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';

import * as EditableFields from '../alien/EditableFields';
import * as Keys from '../alien/Keys';
import { NoState, Stateless } from '../behaviour/common/BehaviourState';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import * as KeyingType from './KeyingType';
import * as KeyingTypes from './KeyingTypes';
import { ExecutingConfig, KeyRuleHandler } from '../keying/KeyingModeTypes';

import { AlloyComponent } from '../api/component/ComponentApi';
import { SugarEvent } from '../alien/TypeDefinitions';
import { EventFormat, SimulatedEvent, NativeSimulatedEvent } from '../events/SimulatedEvent';
import { AlloyEventHandler } from '../api/events/AlloyEvents';

const schema = [
  FieldSchema.defaulted('execute', KeyingTypes.defaultExecute),
  FieldSchema.defaulted('useSpace', false),
  FieldSchema.defaulted('useEnter', true),
  FieldSchema.defaulted('useControlEnter', false),
  FieldSchema.defaulted('useDown', false)
];

const execute: KeyRuleHandler<ExecutingConfig, Stateless> = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent, executeConfig: ExecutingConfig) => {
  return executeConfig.execute()(component, simulatedEvent, component.element());
};

const getKeydownRules = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent, executeConfig: ExecutingConfig, executeState: Stateless): Array<KeyRules.KeyRule<ExecutingConfig, Stateless>> => {
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

const isFirefoxButton = () => true;

const stopEventForFirefox: KeyRuleHandler<ExecutingConfig, Stateless> = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent, executeConfig: ExecutingConfig) => {
  return Option.some(true);
};

const getKeyupRules = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent, executeConfig: ExecutingConfig, executeState: Stateless): Array<KeyRules.KeyRule<ExecutingConfig, Stateless>> => {
  const spaceExec = executeConfig.useSpace() && !EditableFields.inside(component.element()) ? Keys.SPACE() : [ ];

  return executeConfig.useSpace() &&  isFirefoxButton  ? [
    // KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), stopEventForFirefox)
  ] : [ ]
};

export default KeyingType.typical(schema, NoState.init, getKeydownRules, getKeyupRules, Option.none());