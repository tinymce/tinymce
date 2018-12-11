import { AlloyEventHandler } from '../api/events/AlloyEvents';
import { SugarEvent } from '../alien/TypeDefinitions';
import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';

import * as Keys from '../alien/Keys';
import { NoState, Stateless } from '../behaviour/common/BehaviourState';
import * as Fields from '../data/Fields';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import * as KeyingType from './KeyingType';
import { AlloyComponent } from '../api/component/ComponentApi';
import { SpecialConfig } from './KeyingModeTypes';
import { NativeSimulatedEvent, SimulatedEvent, EventFormat } from '../events/SimulatedEvent';
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

const getKeydownRules = (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent, specialInfo: SpecialConfig): Array<KeyRules.KeyRule<SpecialConfig, Stateless>> => {
  const scope = KeyRules.KeyScope.BothScope;
  return [
    KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), scope, specialInfo.onSpace),
    KeyRules.rule(
      KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.ENTER()) ]), scope, specialInfo.onEnter
    ),
    KeyRules.rule(
      KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.ENTER()) ]), scope, specialInfo.onShiftEnter
    ),
    KeyRules.rule(
      KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB()) ]), scope, specialInfo.onShiftTab
    ),
    KeyRules.rule(
      KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.TAB()) ]), scope, specialInfo.onTab
    ),

    KeyRules.rule(KeyMatch.inSet(Keys.UP()), scope, specialInfo.onUp),
    KeyRules.rule(KeyMatch.inSet(Keys.DOWN()), scope, specialInfo.onDown),
    KeyRules.rule(KeyMatch.inSet(Keys.LEFT()), scope, specialInfo.onLeft),
    KeyRules.rule(KeyMatch.inSet(Keys.RIGHT()), scope, specialInfo.onRight),
    KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), scope, specialInfo.onSpace),
    KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE()), scope, specialInfo.onEscape)
  ];
};

const getKeyupRules =  (component: AlloyComponent, simulatedEvent: NativeSimulatedEvent, specialInfo: SpecialConfig): Array<KeyRules.KeyRule<SpecialConfig, Stateless>> => {
  return specialInfo.stopSpaceKeyup ? [
    KeyRules.rule(KeyMatch.inSet(Keys.SPACE()), KeyRules.KeyScope.BothScope, stopEventForFirefox)
  ] : [ ]
};

const focusIn = (component: AlloyComponent, specialInfo: SpecialConfig): Option<boolean>  => {
  return specialInfo.focusIn.bind((f) => {
    return f(component, specialInfo);
  });
};

export default KeyingType.typical(schema, NoState.init, getKeydownRules, getKeyupRules, (specialInfo: SpecialConfig) => specialInfo.focusIn);