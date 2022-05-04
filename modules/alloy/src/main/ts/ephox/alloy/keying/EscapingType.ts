import { Fun, Optional } from '@ephox/katamari';

import * as Keys from '../alien/Keys';
import { NoState, Stateless } from '../behaviour/common/BehaviourState';
import * as Fields from '../data/Fields';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import { EscapingConfig, KeyRuleHandler } from './KeyingModeTypes';
import * as KeyingType from './KeyingType';

// NB: Tsc requires AlloyEventHandler and AlloyComponent to be imported here.
const schema = [
  Fields.onStrictKeyboardHandler('onEscape')
];

const doEscape: KeyRuleHandler<EscapingConfig, Stateless> = (component, simulatedEvent, escapeConfig, _escapeState) => escapeConfig.onEscape(component, simulatedEvent);

const getKeydownRules: () => Array<KeyRules.KeyRule<EscapingConfig, Stateless>> = Fun.constant([ ]);

const getKeyupRules = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE), doEscape)
]);

export default KeyingType.typical(schema, NoState.init, getKeydownRules, getKeyupRules, () => Optional.none());
