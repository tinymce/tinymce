import Keys from '../alien/Keys';
import NoState from '../behaviour/common/NoState';
import Fields from '../data/Fields';
import KeyingType from './KeyingType';
import KeyMatch from '../navigation/KeyMatch';
import KeyRules from '../navigation/KeyRules';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var schema = [
  Fields.onStrictKeyboardHandler('onEscape')
];

var doEscape = function (component, simulatedEvent, escapeConfig, escapeState) {
  return escapeConfig.onEscape()(component, simulatedEvent);
};

var getRules = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE()), doEscape)
]);

var getEvents = Fun.constant({ });
var getApis = Fun.constant({ });

export default <any> KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.none());