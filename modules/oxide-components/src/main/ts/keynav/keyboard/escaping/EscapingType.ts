import { Fun, Optional } from '@ephox/katamari';
import type { SugarElement } from '@ephox/sugar';

import type { GeneralKeyingConfig, KeyRuleHandler } from '../KeyingModeTypes';
import * as KeyingType from '../KeyingType';
import * as KeyMatch from '../KeyMatch';
import * as KeyRules from '../KeyRules';
import * as Keys from '../Keys';

export type KeyHandlerApi = (comp: SugarElement<HTMLElement>, se: Event) => Optional<boolean>;

export interface EscapingConfig {
  readonly onEscape: KeyHandlerApi;
}

interface FullSpecialConfig extends EscapingConfig, GeneralKeyingConfig { }

const create = (source: SugarElement<HTMLElement>, config: EscapingConfig): KeyingType.Handlers => {
  const partialConfig: Required<EscapingConfig> = {
    ...config
  };

  const doEscape: KeyRuleHandler<EscapingConfig> = (component: SugarElement<HTMLElement>, event: Event, config: EscapingConfig) => config.onEscape(component, event);

  const getKeydownRules: () => Array<KeyRules.KeyRule<EscapingConfig>> = Fun.constant([]);

  const getKeyupRules = Fun.constant([
    KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE), doEscape)
  ]);

  const keyingHandlers = KeyingType.typical<FullSpecialConfig>(partialConfig, getKeydownRules, getKeyupRules, () => Optional.none());

  return {
    keydown: (event: KeyboardEvent) => keyingHandlers.handleKeydown(source, event),
    keyup: (event: KeyboardEvent) => keyingHandlers.handleKeyup(source, event),
    focus: (event: FocusEvent) => keyingHandlers.handleFocus(source, event)
  };
};

export {
  create
};
