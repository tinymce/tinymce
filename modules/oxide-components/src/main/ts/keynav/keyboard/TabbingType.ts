import { Arr, Fun, Optional, Optionals } from '@ephox/katamari';
import { Compare, Height, SelectorFilter, SelectorFind, SugarElement, Traverse } from '@ephox/sugar';

import * as ArrNavigation from '../navigation/ArrNavigation';

import type { GeneralKeyingConfig } from './KeyingModeTypes';
import * as KeyingType from './KeyingType';
import * as KeyMatch from './KeyMatch';
import * as KeyRules from './KeyRules';
import * as Keys from './Keys';

export type KeyRuleStatelessHandler<C> = (comp: SugarElement<HTMLElement>, se: Event, config: C) => Optional<boolean>;

export interface TabbingConfig {
  readonly selector: string;
  readonly execute?: (focused: SugarElement<HTMLElement>) => Optional<boolean>;
  readonly escape?: (focused: SugarElement<HTMLElement>) => Optional<boolean>;
  readonly firstTabstop?: number;
  readonly useTabstopAt?: (elem: SugarElement<HTMLElement>) => boolean;
  readonly cyclic?: boolean;
  readonly focusIn?: boolean;
  readonly closest?: boolean;
}

interface FullTabbingConfig extends Required<TabbingConfig>, GeneralKeyingConfig {}

// TODO: Test this
const isVisible = (element: SugarElement<HTMLElement>): boolean => {
  // NOTE: We can't use Visibility.isVisible, because the toolbar has width when it has closed, just not height.
  return Height.get(element) > 0;
};

const findInitial = (component: SugarElement<HTMLElement>, tabbingConfig: FullTabbingConfig): Optional<SugarElement<HTMLElement>> => {
  const tabstops: SugarElement<HTMLElement>[] = SelectorFilter.descendants<HTMLElement>(component, tabbingConfig.selector);
  const visibles: SugarElement<HTMLElement>[] = Arr.filter(tabstops, (elem) => isVisible(elem));
  return Optional.from(visibles[tabbingConfig.firstTabstop]);
};

// TODO: Remove dupe.
const findCurrent = (component: SugarElement<HTMLElement>, tabbingConfig: FullTabbingConfig): Optional<SugarElement<HTMLElement>> => {
  // TODO: Figure out why we need this, without it enter inside a nested element would navigate up to the parent element if both parent and child have handlers
  if (tabbingConfig.closest) {
    return tabbingConfig.focusManager.get(component).bind((elem) => SelectorFind.closest(elem, tabbingConfig.selector));
  } else {
    return tabbingConfig.focusManager.get(component);
  }
};

const isTabstop = (tabbingConfig: FullTabbingConfig, element: SugarElement<HTMLElement>): boolean => tabbingConfig.useTabstopAt(element);

const isFirstChild = (elem: SugarElement<HTMLElement>): boolean =>
  Traverse.parentNode(elem).bind(Traverse.firstChild).exists((child) => Compare.eq(child, elem));

const focusIn = (component: SugarElement<HTMLElement>, tabbingConfig: FullTabbingConfig): void => {
  findInitial(component, tabbingConfig).each((target) => tabbingConfig.focusManager.set(component, target));
};

const goFromTabstop = (
  component: SugarElement<HTMLElement>,
  tabstops: SugarElement<HTMLElement>[],
  stopIndex: number,
  tabbingConfig: FullTabbingConfig,
  cycle: ArrNavigation.ArrCycle<SugarElement<HTMLElement>>
): Optional<boolean> =>
  cycle(tabstops, stopIndex, (elem) => isTabstop(tabbingConfig, elem))
    .fold(
      // Even if there is only one, still capture the event if cycling
      () => tabbingConfig.cyclic ? Optional.some<boolean>(true) : Optional.none(),
      (target) => {
        tabbingConfig.focusManager.set(component, target);
        // Kill the event
        return Optional.some<boolean>(true);
      }
    );

const go = (
  component: SugarElement<HTMLElement>,
  _event: Event,
  tabbingConfig: FullTabbingConfig,
  cycle: ArrNavigation.ArrCycle<SugarElement<HTMLElement>>
): Optional<boolean> => {
  // 1. Find our current tabstop
  // 2. Find the index of that tabstop
  // 3. Cycle the tabstop
  const tabstops = SelectorFilter.descendants<HTMLElement>(component, tabbingConfig.selector);
  return findCurrent(component, tabbingConfig).bind((tabstop) => {
    // focused component
    const optStopIndex = Arr.findIndex(tabstops, Fun.curry(Compare.eq, tabstop));
    return optStopIndex.bind((stopIndex) => goFromTabstop(component, tabstops, stopIndex, tabbingConfig, cycle));
  });
};

const goBackwards: KeyRuleStatelessHandler<FullTabbingConfig> = (component, event, tabbingConfig) => {
  const navigate = tabbingConfig.cyclic ? ArrNavigation.cyclePrev : ArrNavigation.tryPrev;
  return go(component, event, tabbingConfig, navigate);
};

const goForwards: KeyRuleStatelessHandler<FullTabbingConfig> = (component, event, tabbingConfig) => {
  const navigate = tabbingConfig.cyclic ? ArrNavigation.cycleNext : ArrNavigation.tryNext;
  return go(component, event, tabbingConfig, navigate);
};

const goFromPseudoTabstop: KeyRuleStatelessHandler<FullTabbingConfig> = (component, event, tabbingConfig) =>
  findCurrent(component, tabbingConfig).filter((elem) => !tabbingConfig.useTabstopAt(elem)).bind((elem) => (isFirstChild(elem) ? goBackwards : goForwards)(component, event, tabbingConfig));

const execute = (component: SugarElement<HTMLElement>, _event: Event, tabbingConfig: FullTabbingConfig) => findCurrent(component, tabbingConfig).bind((focused) => tabbingConfig.execute(focused));

const escape = (component: SugarElement<HTMLElement>, _event: Event, tabbingConfig: FullTabbingConfig) => findCurrent(component, tabbingConfig).bind((focused) => tabbingConfig.escape(focused));

const getKeydownRules = Fun.constant([
  KeyRules.rule(KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB) ]), goBackwards),
  KeyRules.rule(KeyMatch.inSet(Keys.TAB), goForwards),
  KeyRules.rule(KeyMatch.inSet(Keys.ENTER), execute),
  KeyRules.rule(KeyMatch.inSet(Keys.SPACE), execute),
  KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE), escape),
]);

const getKeyupRules = Fun.constant([
  KeyRules.rule(KeyMatch.inSet(Keys.TAB), goFromPseudoTabstop),
]);

const create = (source: SugarElement<HTMLElement>, config: TabbingConfig): KeyingType.Handlers => {
  const partialConfig: Required<TabbingConfig> = {
    execute: Fun.constant(Optional.none()),
    escape: Fun.constant(Optional.none()),
    firstTabstop: 0,
    useTabstopAt: Fun.always,
    cyclic: true,
    focusIn: false,
    closest: true,
    ...config
  };

  const keyingHandlers = KeyingType.typical<FullTabbingConfig>(partialConfig, getKeydownRules, getKeyupRules, () => Optionals.someIf(partialConfig.focusIn, focusIn));

  return {
    keydown: (event: KeyboardEvent) => keyingHandlers.handleKeydown(source, event),
    keyup: (event: KeyboardEvent) => keyingHandlers.handleKeyup(source, event),
    focus: (event: FocusEvent) => keyingHandlers.handleFocus(source, event)
  };
};

export {
  create
};
