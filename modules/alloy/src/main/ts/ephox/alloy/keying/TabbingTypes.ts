import { FieldProcessor, FieldSchema } from '@ephox/boulder';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { Compare, Height, SelectorFilter, SelectorFind, SugarElement } from '@ephox/sugar';

import * as Keys from '../alien/Keys';
import { AlloyComponent } from '../api/component/ComponentApi';
import { NoState, Stateless } from '../behaviour/common/BehaviourState';
import { NativeSimulatedEvent } from '../events/SimulatedEvent';
import * as ArrNavigation from '../navigation/ArrNavigation';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import { KeyRuleHandler, TabbingConfig } from './KeyingModeTypes';
import * as KeyingType from './KeyingType';

const create = (cyclicField: FieldProcessor): KeyingType.KeyingType<TabbingConfig, Stateless> => {
  const schema: FieldProcessor[] = [
    FieldSchema.option('onEscape'),
    FieldSchema.option('onEnter'),
    FieldSchema.defaulted('selector', '[data-alloy-tabstop="true"]:not(:disabled)'),
    FieldSchema.defaulted('firstTabstop', 0),
    FieldSchema.defaulted('useTabstopAt', Fun.always),
    // Maybe later we should just expose isVisible
    FieldSchema.option('visibilitySelector')
  ].concat([
    cyclicField
  ]);

  // TODO: Test this
  const isVisible = (tabbingConfig: TabbingConfig, element: SugarElement<HTMLElement>): boolean => {
    const target = tabbingConfig.visibilitySelector
      .bind((sel) => SelectorFind.closest<HTMLElement>(element, sel))
      .getOr(element);

    // NOTE: We can't use Visibility.isVisible, because the toolbar has width when it has closed, just not height.
    return Height.get(target) > 0;
  };

  const findInitial = (component: AlloyComponent, tabbingConfig: TabbingConfig): Optional<SugarElement> => {
    const tabstops: SugarElement[] = SelectorFilter.descendants(component.element, tabbingConfig.selector);
    const visibles: SugarElement[] = Arr.filter(tabstops, (elem) => isVisible(tabbingConfig, elem));

    return Optional.from(visibles[tabbingConfig.firstTabstop]);
  };

  const findCurrent = (component: AlloyComponent, tabbingConfig: TabbingConfig): Optional<SugarElement> =>
    tabbingConfig.focusManager.get(component)
      .bind((elem) => SelectorFind.closest(elem, tabbingConfig.selector));

  const isTabstop = (tabbingConfig: TabbingConfig, element: SugarElement): boolean =>
    isVisible(tabbingConfig, element) && tabbingConfig.useTabstopAt(element);

  // Fire an alloy focus on the first visible element that matches the selector
  const focusIn = (component: AlloyComponent, tabbingConfig: TabbingConfig, _tabbingState: Stateless): void => {
    findInitial(component, tabbingConfig).each((target) => {
      tabbingConfig.focusManager.set(component, target);
    });
  };

  const goFromTabstop = (
    component: AlloyComponent,
    tabstops: SugarElement[],
    stopIndex: number,
    tabbingConfig: TabbingConfig,
    cycle: ArrNavigation.ArrCycle<SugarElement>
  ): Optional<boolean> =>
    cycle(tabstops, stopIndex, (elem: SugarElement) => isTabstop(tabbingConfig, elem))
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
    component: AlloyComponent,
    _simulatedEvent: NativeSimulatedEvent,
    tabbingConfig: TabbingConfig,
    cycle: ArrNavigation.ArrCycle<SugarElement>
  ): Optional<boolean> => {
    // 1. Find our current tabstop
    // 2. Find the index of that tabstop
    // 3. Cycle the tabstop
    // 4. Fire alloy focus on the resultant tabstop
    const tabstops: SugarElement[] = SelectorFilter.descendants(component.element, tabbingConfig.selector);
    return findCurrent(component, tabbingConfig).bind((tabstop) => {
      // focused component
      const optStopIndex = Arr.findIndex(tabstops, Fun.curry(Compare.eq, tabstop));

      return optStopIndex.bind((stopIndex) => goFromTabstop(component, tabstops, stopIndex, tabbingConfig, cycle));
    });
  };

  const goBackwards: KeyRuleHandler<TabbingConfig, Stateless> = (component, simulatedEvent, tabbingConfig) => {
    const navigate = tabbingConfig.cyclic ? ArrNavigation.cyclePrev : ArrNavigation.tryPrev;
    return go(component, simulatedEvent, tabbingConfig, navigate);
  };

  const goForwards: KeyRuleHandler<TabbingConfig, Stateless> = (component, simulatedEvent, tabbingConfig) => {
    const navigate = tabbingConfig.cyclic ? ArrNavigation.cycleNext : ArrNavigation.tryNext;
    return go(component, simulatedEvent, tabbingConfig, navigate);
  };

  const execute: KeyRuleHandler<TabbingConfig, Stateless> = (component, simulatedEvent, tabbingConfig) =>
    tabbingConfig.onEnter.bind((f) => f(component, simulatedEvent));

  const exit: KeyRuleHandler<TabbingConfig, Stateless> = (component, simulatedEvent, tabbingConfig) =>
    tabbingConfig.onEscape.bind((f) => f(component, simulatedEvent));

  const getKeydownRules = Fun.constant([
    KeyRules.rule(KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB) ]), goBackwards),
    KeyRules.rule(KeyMatch.inSet(Keys.TAB), goForwards),
    KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE), exit),
    KeyRules.rule(KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.ENTER) ]), execute)
  ]);

  const getKeyupRules = Fun.constant([ ]);

  return KeyingType.typical(schema, NoState.init, getKeydownRules, getKeyupRules, () => Optional.some(focusIn));
};

export {
  create
};
