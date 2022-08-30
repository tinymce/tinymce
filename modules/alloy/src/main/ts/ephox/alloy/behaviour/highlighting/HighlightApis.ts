import { Arr, Num, Optional, Optionals, Result } from '@ephox/katamari';
import { Class, Compare, SelectorFilter, SelectorFind } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as SystemEvents from '../../api/events/SystemEvents';
import { Stateless } from '../common/BehaviourState';
import { HighlightingConfig } from './HighlightingTypes';

// THIS IS NOT API YET
const dehighlightAllExcept = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, skip: AlloyComponent[]): void => {
  const highlighted = SelectorFilter.descendants(component.element, '.' + hConfig.highlightClass);
  Arr.each(highlighted, (h) => {
    // We don't want to dehighlight anything that should be skipped.
    // Generally, this is because we are about to highlight that thing.
    const shouldSkip = Arr.exists(skip, (skipComp) => Compare.eq(skipComp.element, h));
    if (!shouldSkip) {
      Class.remove(h, hConfig.highlightClass);
      component.getSystem().getByDom(h).each((target) => {
        hConfig.onDehighlight(component, target);
        AlloyTriggers.emit(target, SystemEvents.dehighlight());
      });
    }
  });
};

const dehighlightAll = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless): void => dehighlightAllExcept(component, hConfig, hState, []);

const dehighlight = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, target: AlloyComponent): void => {
  // Only act if it was highlighted.
  if (isHighlighted(component, hConfig, hState, target)) {
    Class.remove(target.element, hConfig.highlightClass);
    hConfig.onDehighlight(component, target);
    AlloyTriggers.emit(target, SystemEvents.dehighlight());
  }
};

const highlight = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, target: AlloyComponent): void => {
  // If asked to highlight something, dehighlight everything else first except
  // for the new thing we are going to highlight. It's a rare case, but we don't
  // want to get an onDehighlight, onHighlight for the same item on a highlight call.
  // We also don't want to call onHighlight if it was already highlighted.
  //
  // Note, that there is an important distinction here: highlight is NOT a no-op
  // if target is already highlighted, because it will still dehighlight everything else.
  // However, it won't fire any onHighlight or onDehighlight handlers for the already
  // highlighted item. I'm not sure if this is behaviour we need to maintain, but it is now
  // tested. A simpler approach might just be to not do anything if it's already highlighted,
  // but that could leave us in an inconsistent state, where multiple items have highlights
  // even after a highlight call. This way, highlight validates the highlights in the
  // component, and ensures there is only one thing highlighted.
  dehighlightAllExcept(component, hConfig, hState, [ target ]);

  if (!isHighlighted(component, hConfig, hState, target)) {
    Class.add(target.element, hConfig.highlightClass);
    hConfig.onHighlight(component, target);
    AlloyTriggers.emit(target, SystemEvents.highlight());
  }
};

const highlightFirst = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless): void => {
  getFirst(component, hConfig, hState).each((firstComp) => {
    highlight(component, hConfig, hState, firstComp);
  });
};

const highlightLast = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless): void => {
  getLast(component, hConfig, hState).each((lastComp) => {
    highlight(component, hConfig, hState, lastComp);
  });
};

const highlightAt = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, index: number): void => {
  getByIndex(component, hConfig, hState, index).fold((err) => {
    throw err;
  }, (firstComp) => {
    highlight(component, hConfig, hState, firstComp);
  });
};

const highlightBy = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, predicate: (comp: AlloyComponent) => boolean): void => {
  const candidates = getCandidates(component, hConfig, hState);
  const targetComp = Arr.find(candidates, predicate);
  targetComp.each((c) => {
    highlight(component, hConfig, hState, c);
  });
};

const isHighlighted = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, queryTarget: AlloyComponent): boolean => Class.has(queryTarget.element, hConfig.highlightClass);

const getHighlighted = (component: AlloyComponent, hConfig: HighlightingConfig, _hState: Stateless): Optional<AlloyComponent> =>
  SelectorFind.descendant(component.element, '.' + hConfig.highlightClass).bind((e) => component.getSystem().getByDom(e).toOptional());

const getByIndex = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, index: number): Result<AlloyComponent, Error> => {
  const items = SelectorFilter.descendants(component.element, '.' + hConfig.itemClass);

  return Optional.from(items[index]).fold(() => Result.error(new Error('No element found with index ' + index)), component.getSystem().getByDom);
};

const getFirst = (component: AlloyComponent, hConfig: HighlightingConfig, _hState: Stateless): Optional<AlloyComponent> =>
  SelectorFind.descendant(component.element, '.' + hConfig.itemClass).bind((e) => component.getSystem().getByDom(e).toOptional());

const getLast = (component: AlloyComponent, hConfig: HighlightingConfig, _hState: Stateless): Optional<AlloyComponent> => {
  const items = SelectorFilter.descendants(component.element, '.' + hConfig.itemClass);
  const last = items.length > 0 ? Optional.some(items[items.length - 1]) : Optional.none();
  return last.bind((c) => component.getSystem().getByDom(c).toOptional());
};

const getDelta = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, delta: number): Optional<AlloyComponent> => {
  const items = SelectorFilter.descendants(component.element, '.' + hConfig.itemClass);
  const current = Arr.findIndex(items, (item) => Class.has(item, hConfig.highlightClass));

  return current.bind((selected) => {
    const dest = Num.cycleBy(selected, delta, 0, items.length - 1);
    return component.getSystem().getByDom(items[dest]).toOptional();
  });
};

const getPrevious = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless): Optional<AlloyComponent> => getDelta(component, hConfig, hState, -1);

const getNext = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless): Optional<AlloyComponent> => getDelta(component, hConfig, hState, +1);

const getCandidates = (component: AlloyComponent, hConfig: HighlightingConfig, _hState: Stateless): AlloyComponent[] => {
  const items = SelectorFilter.descendants(component.element, '.' + hConfig.itemClass);
  return Optionals.cat(
    Arr.map(items, (i) => component.getSystem().getByDom(i).toOptional())
  );
};

export {
  dehighlightAll,
  dehighlight,
  highlight,
  highlightFirst,
  highlightLast,
  highlightAt,
  highlightBy,
  isHighlighted,
  getHighlighted,
  getFirst,
  getLast,
  getPrevious,
  getNext,
  getCandidates
};
