import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as FocusManagers from './FocusManagers';
import { FocusInsideModes, type GeneralKeyingConfig } from './KeyingModeTypes';
import * as KeyRules from './KeyRules';

type GetRulesFunc<C> = (component: SugarElement<HTMLElement>, event: KeyboardEvent, keyingConfig: C) => Array<KeyRules.KeyRule<C>>;

export interface KeyingType {
  readonly handleKeyup: (component: SugarElement<HTMLElement>, event: KeyboardEvent) => void;
  readonly handleKeydown: (component: SugarElement<HTMLElement>, event: KeyboardEvent) => void;
  readonly handleFocus: (component: SugarElement<HTMLElement>, event: FocusEvent) => void;
}

export interface Handlers {
  readonly keydown: (event: KeyboardEvent) => void;
  readonly keyup: (event: KeyboardEvent) => void;
  readonly focus: (event: FocusEvent) => void;
}

const typical = <C extends GeneralKeyingConfig>(
  config: any,
  getKeydownRules: (comp: SugarElement<HTMLElement>, se: KeyboardEvent, keyingConfig: C) => Array<KeyRules.KeyRule<C>>,
  getKeyupRules: (comp: SugarElement<HTMLElement>, se: KeyboardEvent, keyingConfig: C) => Array<KeyRules.KeyRule<C>>,
  optFocusIn: (keyingConfig: C) => Optional<(comp: SugarElement<HTMLElement>, keyingConfig: C) => void>): KeyingType => {

  const keyingConfig: C = {
    ...config,
    focusManager: FocusManagers.dom(),
    focusInside: FocusInsideModes.OnFocusMode,
    focusIn: optFocusIn
  };

  const processKey = (component: SugarElement<HTMLElement>, event: KeyboardEvent, getRules: GetRulesFunc<C>): Optional<boolean> => {
    const rules = getRules(component, event, keyingConfig);
    return KeyRules.choose(rules, event).bind((rule) => rule(component, event, keyingConfig));
  };

  const handleKeydown = (component: SugarElement<HTMLElement>, event: KeyboardEvent) =>
    processKey(component, event, getKeydownRules).each(
      (_) => {
        // Prevent the browser's default handler when the event is already handled
        event.preventDefault();
        event.stopPropagation();
      }
    );

  const handleKeyup = (component: SugarElement<HTMLElement>, event: KeyboardEvent) =>
    processKey(component, event, getKeyupRules).each(() => {
      // Prevent the browser's default handler when the event is already handled
      event.preventDefault();
      event.stopPropagation();
    });

  const handleFocus = (component: SugarElement<HTMLElement>, event: FocusEvent) => {
    optFocusIn(keyingConfig).each((focusIn) => {
      focusIn(component, keyingConfig);
      event.preventDefault();
      event.stopPropagation();
    });
  };

  return {
    handleKeydown,
    handleKeyup,
    handleFocus
  };
};

export {
  typical
};
