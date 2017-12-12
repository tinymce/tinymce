import Keys from '../alien/Keys';
import NoState from '../behaviour/common/NoState';
import Fields from '../data/Fields';
import KeyingType from './KeyingType';
import KeyMatch from '../navigation/KeyMatch';
import KeyRules from '../navigation/KeyRules';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var schema = [
  Fields.onKeyboardHandler('onSpace'),
  Fields.onKeyboardHandler('onEnter'),
  Fields.onKeyboardHandler('onShiftEnter'),
  Fields.onKeyboardHandler('onLeft'),
  Fields.onKeyboardHandler('onRight'),
  Fields.onKeyboardHandler('onTab'),
  Fields.onKeyboardHandler('onShiftTab'),
  Fields.onKeyboardHandler('onUp'),
  Fields.onKeyboardHandler('onDown'),
  Fields.onKeyboardHandler('onEscape'),
  FieldSchema.option('focusIn')
];

var getRules = function (component, simulatedEvent, executeInfo) {
  return [
    KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), executeInfo.onSpace()),
    KeyRules.rule(
      KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.ENTER()) ]), executeInfo.onEnter()
    ),
    KeyRules.rule(
      KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.ENTER()) ]), executeInfo.onShiftEnter()
    ),
    KeyRules.rule(
      KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB()) ]), executeInfo.onShiftTab()
    ),
    KeyRules.rule(
      KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.TAB()) ]), executeInfo.onTab()
    ),

    KeyRules.rule(KeyMatch.inSet(Keys.UP()), executeInfo.onUp()),
    KeyRules.rule(KeyMatch.inSet(Keys.DOWN()), executeInfo.onDown()),
    KeyRules.rule(KeyMatch.inSet(Keys.LEFT()), executeInfo.onLeft()),
    KeyRules.rule(KeyMatch.inSet(Keys.RIGHT()), executeInfo.onRight()),
    KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), executeInfo.onSpace()),
    KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE()), executeInfo.onEscape())
  ];
};

var focusIn = function (component, executeInfo) {
  return executeInfo.focusIn().bind(function (f) {
    return f(component, executeInfo);
  });
};

var getEvents = Fun.constant({ });
var getApis = Fun.constant({ });

export default <any> KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.some(focusIn));