import { FieldSchema } from '@ephox/boulder';

import * as Keys from '../alien/Keys';
import { AlloyComponent } from '../api/component/ComponentApi';
import { NoState, Stateless } from '../behaviour/common/BehaviourState';
import * as Fields from '../data/Fields';
import { NativeSimulatedEvent } from '../events/SimulatedEvent';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import { SpecialConfig } from './KeyingModeTypes';
import * as KeyingType from './KeyingType';
import { stopEventForFirefox } from './KeyingTypes';

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
  FieldSchema.defaulted('stopSpaceKeyup', false),
  FieldSchema.option('focusIn')
];

const getKeydownRules = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent, specialInfo: SpecialConfig): Array<KeyRules.KeyRule<SpecialConfig, Stateless>> => [
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), specialInfo.onSpace),
  KeyRules.rule(
    KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.ENTER()) ]), specialInfo.onEnter
  ),
  KeyRules.rule(
    KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.ENTER()) ]), specialInfo.onShiftEnter
  ),
  KeyRules.rule(
    KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB()) ]), specialInfo.onShiftTab
  ),
  KeyRules.rule(
    KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.TAB()) ]), specialInfo.onTab
  ),

  KeyRules.rule(KeyMatch.inSet(Keys.UP()), specialInfo.onUp),
  KeyRules.rule(KeyMatch.inSet(Keys.DOWN()), specialInfo.onDown),
  KeyRules.rule(KeyMatch.inSet(Keys.LEFT()), specialInfo.onLeft),
  KeyRules.rule(KeyMatch.inSet(Keys.RIGHT()), specialInfo.onRight),
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), specialInfo.onSpace),
  KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE()), specialInfo.onEscape)
];

const getKeyupRules = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent, specialInfo: SpecialConfig): Array<KeyRules.KeyRule<SpecialConfig, Stateless>> => specialInfo.stopSpaceKeyup ? [
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), stopEventForFirefox)
] : [ ];

export default KeyingType.typical(schema, NoState.init, getKeydownRules, getKeyupRules, (specialInfo: SpecialConfig) => specialInfo.focusIn);
