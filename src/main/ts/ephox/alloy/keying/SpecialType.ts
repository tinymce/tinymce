import { FieldSchema } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';

import Keys from '../alien/Keys';
import * as NoState from '../behaviour/common/NoState';
import * as Fields from '../data/Fields';
import KeyMatch from '../navigation/KeyMatch';
import KeyRules from '../navigation/KeyRules';
import * as KeyingType from './KeyingType';

const schema = [
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

const getRules = function (component, simulatedEvent, executeInfo) {
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

const focusIn = function (component, executeInfo) {
  return executeInfo.focusIn().bind(function (f) {
    return f(component, executeInfo);
  });
};

const getEvents = Fun.constant({ });
const getApis = Fun.constant({ });

export default <any> KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.some(focusIn));