import { FieldSchema } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';

import Keys from '../alien/Keys';
import { NoState } from '../behaviour/common/BehaviourState';
import * as Fields from '../data/Fields';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
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

const getRules = (component, simulatedEvent, specialInfo) => {
  return [
    KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), specialInfo.onSpace()),
    KeyRules.rule(
      KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.ENTER()) ]), specialInfo.onEnter()
    ),
    KeyRules.rule(
      KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.ENTER()) ]), specialInfo.onShiftEnter()
    ),
    KeyRules.rule(
      KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB()) ]), specialInfo.onShiftTab()
    ),
    KeyRules.rule(
      KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.TAB()) ]), specialInfo.onTab()
    ),

    KeyRules.rule(KeyMatch.inSet(Keys.UP()), specialInfo.onUp()),
    KeyRules.rule(KeyMatch.inSet(Keys.DOWN()), specialInfo.onDown()),
    KeyRules.rule(KeyMatch.inSet(Keys.LEFT()), specialInfo.onLeft()),
    KeyRules.rule(KeyMatch.inSet(Keys.RIGHT()), specialInfo.onRight()),
    KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), specialInfo.onSpace()),
    KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE()), specialInfo.onEscape())
  ];
};

const focusIn = (component, specialInfo) => {
  return specialInfo.focusIn().bind((f) => {
    return f(component, specialInfo);
  });
};

const getEvents = Fun.constant({ });
const getApis = Fun.constant({ });

export default <any> KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.some(focusIn));