import { Fun, Optional } from '@ephox/katamari';
import { type SugarElement, Attribute, SugarNode } from '@ephox/sugar';

import type { GeneralKeyingConfig, KeyRuleHandler } from '../KeyingModeTypes';
import * as KeyingType from '../KeyingType';
import * as KeyMatch from '../KeyMatch';
import * as KeyRules from '../KeyRules';
import * as Keys from '../Keys';

export type KeyHandlerApi = (comp: SugarElement<HTMLElement>, se: Event) => Optional<boolean>;

export interface ExecutingConfig {
  readonly doExecute: KeyHandlerApi;
  readonly useSpace: boolean;
  readonly useEnter: boolean;
  readonly useControlEnter: boolean;
  readonly useDown: boolean;
}

interface FullExecutionConfig extends ExecutingConfig, GeneralKeyingConfig { }

const isInput = SugarNode.isTag('input');
const isNotRadioInput = (target: SugarElement<HTMLElement>) => Attribute.get(target, 'type') !== 'radio';
const isTextarea = SugarNode.isTag('textarea');

const inside = (target: SugarElement<HTMLElement>): boolean => (
  isInput(target) && isNotRadioInput(target) || isTextarea(target)
);

// On Firefox, pressing space fires a click event if the element maintains focus and fires a keyup. This
// stops the keyup, which should stop the click. We might want to make this only work for buttons and Firefox etc,
// but at this stage it's cleaner to just always do it. It makes sense that Keying that handles space should handle
// keyup also. This does make the name confusing, though.
const stopEventForFirefox = () => Optional.some<boolean>(true);

const create = (source: SugarElement<HTMLElement>, config: ExecutingConfig): KeyingType.Handlers => {
  const partialConfig: Required<ExecutingConfig> = {
    ...config
  };

  const doExecute: KeyRuleHandler<ExecutingConfig> = (component: SugarElement<HTMLElement>, event: Event, config: ExecutingConfig) => config.doExecute(component, event);

  const spaceExec = config.useSpace && !inside(source) ? Keys.SPACE : [];
  const enterExec = config.useEnter ? Keys.ENTER : [];
  const downExec = config.useDown ? Keys.DOWN : [];
  const execKeys = spaceExec.concat(enterExec).concat(downExec);

  const getKeydownRules: () => Array<KeyRules.KeyRule<ExecutingConfig>> = Fun.constant([
    KeyRules.rule(KeyMatch.inSet(execKeys), doExecute)
  ].concat(config.useControlEnter ? [
    KeyRules.rule(KeyMatch.and([ KeyMatch.isControl, KeyMatch.inSet(Keys.ENTER) ]), doExecute)
  ] : []));

  const getKeyupRules = Fun.constant(
    config.useSpace && !inside(source) ? [ KeyRules.rule(KeyMatch.inSet(Keys.SPACE), stopEventForFirefox) ] : []);

  const keyingHandlers = KeyingType.typical<FullExecutionConfig>(partialConfig, getKeydownRules, getKeyupRules, () => Optional.none());

  return {
    keydown: (event: KeyboardEvent) => keyingHandlers.handleKeydown(source, event),
    keyup: (event: KeyboardEvent) => keyingHandlers.handleKeyup(source, event),
    focus: (event: FocusEvent) => keyingHandlers.handleFocus(source, event)
  };
};

export {
  create
};
