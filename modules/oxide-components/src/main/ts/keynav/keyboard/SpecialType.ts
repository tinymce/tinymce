import { Arr, Optional, Type } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import type { GeneralKeyingConfig } from './KeyingModeTypes';
import * as KeyingType from './KeyingType';
// import { KeyHandlerApi } from './KeyingType';
import * as KeyMatch from './KeyMatch';
import * as KeyRules from './KeyRules';
import * as Keys from './Keys';

interface SpecialKeyHandlers {
  readonly onSpace?: () => void;
  readonly onEnter?: () => void;
  readonly onTab?: () => void;
  readonly onShiftTab?: () => void;
  readonly onShiftEnter?: () => void;
  readonly onLeft?: () => void;
  readonly onRight?: () => void;
  readonly onUp?: () => void;
  readonly onDown?: () => void;
  readonly onEscape?: () => void;
}

interface SpecialKeyRuleHandlers {
  readonly onSpace: () => Optional<boolean>;
  readonly onEnter: () => Optional<boolean>;
  readonly onTab: () => Optional<boolean>;
  readonly onShiftTab: () => Optional<boolean>;
  readonly onShiftEnter: () => Optional<boolean>;
  readonly onLeft: () => Optional<boolean>;
  readonly onRight: () => Optional<boolean>;
  readonly onUp: () => Optional<boolean>;
  readonly onDown: () => Optional<boolean>;
  readonly onEscape: () => Optional<boolean>;
}

export interface SpecialConfig extends SpecialKeyHandlers {
}

interface FullSpecialKeyRuleHandler extends SpecialKeyRuleHandlers {
}

interface FullSpecialConfig extends FullSpecialKeyRuleHandler, GeneralKeyingConfig {}

export const create = (source: SugarElement<HTMLElement>, props: SpecialConfig): KeyingType.Handlers => {

  const getKeydownRules = (_component: SugarElement<HTMLElement>, _simulatedEvent: KeyboardEvent, config: FullSpecialConfig): Array<KeyRules.KeyRule<FullSpecialConfig>> => [
    KeyRules.rule(
      KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.ENTER) ]), config.onShiftEnter
    ),
    KeyRules.rule(
      KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.ENTER) ]), config.onEnter
    ),
    KeyRules.rule(
      KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB) ]), config.onShiftTab
    ),
    KeyRules.rule(
      KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.TAB) ]), config.onTab
    ),
    KeyRules.rule(KeyMatch.inSet(Keys.UP), config.onUp),
    KeyRules.rule(KeyMatch.inSet(Keys.DOWN), config.onDown),
    KeyRules.rule(KeyMatch.inSet(Keys.LEFT), config.onLeft),
    KeyRules.rule(KeyMatch.inSet(Keys.RIGHT), config.onRight),
    KeyRules.rule(KeyMatch.inSet(Keys.SPACE), config.onSpace)
  ];

  const getKeyupRules = (_component: SugarElement<HTMLElement>, _event: Event, config: FullSpecialConfig): Array<KeyRules.KeyRule<FullSpecialConfig>> => [
    // ...( [ KeyRules.rule(KeyMatch.inSet(Keys.SPACE), stopEventForFirefox) ] : [ ]),
    KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE), config.onEscape)
  ];

  const toKeyHandler = (fn?: () => any): () => Optional<boolean> => () => {
    if (Type.isFunction(fn)) {
      fn();
      return Optional.some(true);
    } else {
      return Optional.none();
    }
  };

  const partialConfig: FullSpecialKeyRuleHandler = {
    onSpace: toKeyHandler(props.onSpace),
    onEnter: toKeyHandler(props.onEnter),
    onShiftEnter: toKeyHandler(props.onShiftEnter),
    onTab: toKeyHandler(props.onTab),
    onShiftTab: toKeyHandler(props.onShiftTab),
    onLeft: toKeyHandler(props.onLeft),
    onRight: toKeyHandler(props.onRight),
    onUp: toKeyHandler(props.onUp),
    onDown: toKeyHandler(props.onDown),
    onEscape: toKeyHandler(props.onEscape),
  };

  const keyingHandlers = KeyingType.typical<FullSpecialConfig>(partialConfig, getKeydownRules, getKeyupRules, () => Optional.none());

  return {
    keydown: (event: KeyboardEvent) => keyingHandlers.handleKeydown(source, event),
    keyup: (event: KeyboardEvent) => keyingHandlers.handleKeyup(source, event),
    focus: (event: FocusEvent) => keyingHandlers.handleFocus(source, event)
  };
};

export const toBeHandled = (key: KeyboardEvent): boolean => Arr.exists([
  KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.ENTER) ]),
  KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.ENTER) ]),
  KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB) ]),
  KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.TAB) ]),
  KeyMatch.inSet(Keys.UP),
  KeyMatch.inSet(Keys.DOWN),
  KeyMatch.inSet(Keys.LEFT),
  KeyMatch.inSet(Keys.RIGHT),
  KeyMatch.inSet(Keys.SPACE),
], (fn) => fn(key));
