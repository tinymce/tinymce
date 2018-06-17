import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Arr, Fun, Option } from '@ephox/katamari';
import { Compare, Height, SelectorFilter, SelectorFind } from '@ephox/sugar';

import Keys from '../alien/Keys';
import { NoState } from '../behaviour/common/BehaviourState';
import * as ArrNavigation from '../navigation/ArrNavigation';
import * as KeyMatch from '../navigation/KeyMatch';
import * as KeyRules from '../navigation/KeyRules';
import * as KeyingType from './KeyingType';

const create = (cyclicField) => {
  const schema: FieldProcessorAdt[] = [
    FieldSchema.option('onEscape'),
    FieldSchema.option('onEnter'),
    FieldSchema.defaulted('selector', '[data-alloy-tabstop="true"]'),
    FieldSchema.defaulted('firstTabstop', 0),
    FieldSchema.defaulted('useTabstopAt', Fun.constant(true)),
    // Maybe later we should just expose isVisible
    FieldSchema.option('visibilitySelector')
  ].concat([
    cyclicField
  ]);

  // TODO: Test this
  const isVisible = (tabbingConfig, element) => {
    const target = tabbingConfig.visibilitySelector().bind((sel) => {
      return SelectorFind.closest(element, sel);
    }).getOr(element);

    // NOTE: We can't use Visibility.isVisible, because the toolbar has width when it has closed, just not height.
    return Height.get(target) > 0;
  };

  const findInitial = (component, tabbingConfig) => {
    const tabstops = SelectorFilter.descendants(component.element(), tabbingConfig.selector());
    const visibles = Arr.filter(tabstops, (elem) => {
      return isVisible(tabbingConfig, elem);
    });

    return Option.from(visibles[tabbingConfig.firstTabstop()]);
  };

  const findCurrent = (component, tabbingConfig) => {
    return tabbingConfig.focusManager().get(component).bind((elem) => {
      return SelectorFind.closest(elem, tabbingConfig.selector());
    });
  };

  const isTabstop = (tabbingConfig, element) => {
    return isVisible(tabbingConfig, element) && tabbingConfig.useTabstopAt()(element);
  };

  // Fire an alloy focus on the first visible element that matches the selector
  const focusIn = (component, tabbingConfig) => {
    findInitial(component, tabbingConfig).each((target) => {
      tabbingConfig.focusManager().set(component, target);
    });
  };

  const goFromTabstop = (component, tabstops, stopIndex, tabbingConfig, cycle) => {
    return cycle(tabstops, stopIndex, (elem) => {
      return isTabstop(tabbingConfig, elem);
    }).fold(() => {
      // Even if there is only one, still capture the event if cycling
      return tabbingConfig.cyclic() ? Option.some(true) : Option.none();
    }, (target) => {
      tabbingConfig.focusManager().set(component, target);
      // Kill the event
      return Option.some(true);
    });
  };

  const go = (component, simulatedEvent, tabbingConfig, cycle) => {
    // 1. Find our current tabstop
    // 2. Find the index of that tabstop
    // 3. Cycle the tabstop
    // 4. Fire alloy focus on the resultant tabstop
    const tabstops = SelectorFilter.descendants(component.element(), tabbingConfig.selector());
    return findCurrent(component, tabbingConfig).bind((tabstop) => {
      // focused component
      const optStopIndex = Arr.findIndex(tabstops, Fun.curry(Compare.eq, tabstop));

      return optStopIndex.bind((stopIndex) => {
        return goFromTabstop(component, tabstops, stopIndex, tabbingConfig, cycle);
      });
    });
  };

  const goBackwards = (component, simulatedEvent, tabbingConfig, tabbingState) => {
    const navigate = tabbingConfig.cyclic() ? ArrNavigation.cyclePrev : ArrNavigation.tryPrev;
    return go(component, simulatedEvent, tabbingConfig, navigate);
  };

  const goForwards = (component, simulatedEvent, tabbingConfig, tabbingState) => {
    const navigate = tabbingConfig.cyclic() ? ArrNavigation.cycleNext : ArrNavigation.tryNext;
    return go(component, simulatedEvent, tabbingConfig, navigate);
  };

  const execute = (component, simulatedEvent, tabbingConfig, tabbingState) => {
    return tabbingConfig.onEnter().bind((f) => {
      return f(component, simulatedEvent);
    });
  };

  const exit = (component, simulatedEvent, tabbingConfig, tabbingState) => {
    return tabbingConfig.onEscape().bind((f) => {
      return f(component, simulatedEvent);
    });
  };

  const getRules = Fun.constant([
    KeyRules.rule(KeyMatch.and([ KeyMatch.isShift, KeyMatch.inSet(Keys.TAB()) ]), goBackwards),
    KeyRules.rule(KeyMatch.inSet(Keys.TAB()), goForwards),
    KeyRules.rule(KeyMatch.inSet(Keys.ESCAPE()), exit),
    KeyRules.rule(KeyMatch.and([ KeyMatch.isNotShift, KeyMatch.inSet(Keys.ENTER()) ]), execute)
  ]);

  const getEvents = Fun.constant({ });
  const getApis = Fun.constant({ });

  return KeyingType.typical(schema, NoState.init, getRules, getEvents, getApis, Option.some(focusIn));
};

export {
  create
};