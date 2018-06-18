import { Fun, Option } from '@ephox/katamari';

import Keys from '../alien/Keys';
import { NoState, Stateless } from '../behaviour/common/BehaviourState';
import * as Fields from '../data/Fields';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import * as KeyingType from './KeyingType';
import { KeyRuleHandler, EscapingConfig } from 'ephox/alloy/keying/KeyingModeTypes';
import { KeyRule } from '../navigation/KeyRules';

import { AlloyComponent } from '../api/component/ComponentApi';
import * as TabbingTypes from './TabbingTypes';
import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';


import { SugarEvent } from '../alien/TypeDefinitions';
import { EventFormat, SimulatedEvent } from '../events/SimulatedEvent';
import { AlloyEventHandler } from '../api/events/AlloyEvents';


const schema = [
  Fields.onStrictKeyboardHandler('onEscape')
];

const doEscape: KeyRuleHandler<EscapingConfig, Stateless> = (component, simulatedEvent, escapeConfig, escapeState) => {
  return escapeConfig.onEscape()(component, simulatedEvent);
};

const getRules: () => KeyRule<EscapingConfig, Stateless>[] = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE()), doEscape)
]);

const getEvents = Fun.constant({ });
const getApis = Fun.constant({ });

export default KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.none());