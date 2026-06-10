import { Fun, Optional, Optionals } from '@ephox/katamari';
import { SelectorFind, SugarElement } from '@ephox/sugar';

import * as DomMovement from '../../navigation/DomMovement';
import * as DomNavigation from '../../navigation/DomNavigation';
import type { GeneralKeyingConfig, KeyRuleHandler } from '../KeyingModeTypes';
import * as KeyingType from '../KeyingType';
import * as KeyMatch from '../KeyMatch';
import * as KeyRules from '../KeyRules';
import * as Keys from '../Keys';

export interface FlowConfig {
  /**  The selector used to find the next element to focus. */
  readonly selector: string;
  /**  The function to execute when we press enter while the element is focused. */
  readonly execute?: (focused: SugarElement<HTMLElement>) => Optional<boolean>;
  /** The function to execute when we press escape while the element is focused. */
  readonly escape?: (focused: SugarElement<HTMLElement>) => Optional<boolean>;
  /** Whether to allow vertical movement.  */
  readonly allowVertical?: boolean;
  /** Whether to allow horizontal movement. */
  readonly allowHorizontal?: boolean;
  /** Whether to allow cycling through elements. */
  readonly cycles?: boolean;
  readonly focusIn?: boolean;
  readonly closest?: boolean;
}

interface FullFlowConfig extends Required<FlowConfig>, GeneralKeyingConfig {}

export const create = (source: SugarElement<HTMLElement>, config: FlowConfig): KeyingType.Handlers => {
  const defaultExecute = (
    focused: SugarElement<HTMLElement>
  ): Optional<boolean> => {
    focused.dom.click();
    return Optional.some(true);
  };

  // TODO: Remove dupe.
  // TODO: Probably use this for not just execution.
  const findCurrent = (component: SugarElement<HTMLElement>, flowConfig: FullFlowConfig): Optional<SugarElement<HTMLElement>> => {
    // TODO: Figure out why we need this, without it enter inside a nested element would navigate up to the parent element if both parent and child have handlers
    if (flowConfig.closest) {
      return flowConfig.focusManager.get(component).bind((elem) => SelectorFind.closest(elem, flowConfig.selector));
    } else {
      return flowConfig.focusManager.get(component);
    }
  };

  const execute = (component: SugarElement<HTMLElement>, _event: Event, flowConfig: FullFlowConfig) => findCurrent(component, flowConfig).bind((focused) => flowConfig.execute(focused));

  const escape = (component: SugarElement<HTMLElement>, _event: Event, flowConfig: FullFlowConfig) => findCurrent(component, flowConfig).bind((focused) => flowConfig.escape(focused));

  const focusIn = (component: SugarElement<HTMLElement>, flowConfig: FullFlowConfig) => {
    SelectorFind.descendant<HTMLElement>(component, flowConfig.selector)
      .each((first) => {
        flowConfig.focusManager.set(component, first);
      });
  };

  const moveDelta = (delta: number) => (element: SugarElement<HTMLElement>, focused: SugarElement<HTMLElement>, info: FullFlowConfig): Optional<SugarElement<HTMLElement>> => {
    const move = info.cycles ? DomNavigation.horizontal : DomNavigation.horizontalWithoutCycles;
    return move(element, info.selector, focused, delta);
  };

  const moveLeft = moveDelta(-1);
  const moveRight = moveDelta(+1);

  const doMove = (movement: KeyRuleHandler<FullFlowConfig>): KeyRuleHandler<FullFlowConfig> =>
    (component, event, flowConfig) => movement(component, event, flowConfig);

  const getKeydownRules = (
    _component: SugarElement<HTMLElement>,
    _se: Event,
    flowConfig: FullFlowConfig
  ): Array<KeyRules.KeyRule<FullFlowConfig>> => {
    const westMovers = [ ...flowConfig.allowHorizontal ? Keys.LEFT : [] ].concat(flowConfig.allowVertical ? Keys.UP : [ ]);
    const eastMovers = [ ...flowConfig.allowHorizontal ? Keys.RIGHT : [] ].concat(flowConfig.allowVertical ? Keys.DOWN : [ ]);
    return [
      KeyRules.rule(KeyMatch.inSet(westMovers), doMove(DomMovement.west(moveLeft, moveRight))),
      KeyRules.rule(KeyMatch.inSet(eastMovers), doMove(DomMovement.east(moveLeft, moveRight))),
      KeyRules.rule(KeyMatch.inSet(Keys.ENTER), execute),
      KeyRules.rule(KeyMatch.inSet(Keys.SPACE), execute),
      KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE), escape),
    ];
  };

  const getKeyupRules: () => Array<KeyRules.KeyRule<FlowConfig>> = Fun.constant([]);

  // Default to whatever needed for this task
  const partialConfig: Required<FlowConfig> = {
    execute: defaultExecute,
    escape: Fun.constant(Optional.none()),
    allowVertical: true,
    allowHorizontal: true,
    cycles: true,
    focusIn: false,
    closest: true,
    ...config
  };

  const keyingHandlers = KeyingType.typical<FullFlowConfig>(partialConfig, getKeydownRules, getKeyupRules, () => Optionals.someIf(partialConfig.focusIn, focusIn));

  return {
    keydown: (event: KeyboardEvent) => keyingHandlers.handleKeydown(source, event),
    keyup: (event: KeyboardEvent) => keyingHandlers.handleKeyup(source, event),
    focus: (event: FocusEvent) => keyingHandlers.handleFocus(source, event)
  };
};
