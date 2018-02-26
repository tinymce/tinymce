import { Fun, Option } from '@ephox/katamari';

import Keys from '../alien/Keys';
import * as NoState from '../behaviour/common/NoState';
import * as Fields from '../data/Fields';
import KeyMatch from '../navigation/KeyMatch';
import KeyRules from '../navigation/KeyRules';
import KeyingType from './KeyingType';

const schema = [
  Fields.onStrictKeyboardHandler('onEscape')
];

const doEscape = function (component, simulatedEvent, escapeConfig, escapeState) {
  return escapeConfig.onEscape()(component, simulatedEvent);
};

const getRules = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE()), doEscape)
]);

const getEvents = Fun.constant({ });
const getApis = Fun.constant({ });

export default <any> KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.none());