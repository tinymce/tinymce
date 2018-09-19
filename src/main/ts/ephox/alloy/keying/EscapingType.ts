import { Fun, Option } from '@ephox/katamari';

import * as Keys from '../alien/Keys';
import { NoState, Stateless } from '../behaviour/common/BehaviourState';
import * as Fields from '../data/Fields';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import * as KeyingType from './KeyingType';
import { KeyRuleHandler, EscapingConfig } from '../keying/KeyingModeTypes';

// NB: Tsc requires AlloyEventHandler and AlloyComponent to be imported here.
import { AlloyEventHandler } from '../api/events/AlloyEvents';
import { AlloyComponent } from '../api/component/ComponentApi';

const schema = [
  Fields.onStrictKeyboardHandler('onEscape')
];

const doEscape: KeyRuleHandler<EscapingConfig, Stateless> = (component, simulatedEvent, escapeConfig, escapeState) => {
  return escapeConfig.onEscape()(component, simulatedEvent);
};

const getKeydownRules: () => Array<KeyRules.KeyRule<EscapingConfig, Stateless>> = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE()), doEscape)
]);

const getKeyupRules = Fun.constant([ ]);

export default KeyingType.typical(schema, NoState.init, getKeydownRules, getKeyupRules, Option.none());