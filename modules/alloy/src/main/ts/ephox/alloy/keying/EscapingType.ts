import { Fun, Option } from '@ephox/katamari';

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

const doEscape: KeyRuleHandler<EscapingConfig, Stateless> = (component, simulatedEvent, escapeConfig, escapeState) => {
  return escapeConfig.onEscape(component, simulatedEvent);
};

const getKeydownRules: () => Array<KeyRules.KeyRule<EscapingConfig, Stateless>> = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE()), doEscape)
]);

const getKeyupRules = Fun.constant([ ]);

export default KeyingType.typical(schema, NoState.init, getKeydownRules, getKeyupRules, () => Option.none());
