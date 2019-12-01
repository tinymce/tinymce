import { Arr, Option, Options, Result, Num } from '@ephox/katamari';
import { Class, SelectorFilter, SelectorFind, Element } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as SystemEvents from '../../api/events/SystemEvents';
import { HighlightingConfig } from '../../behaviour/highlighting/HighlightingTypes';
import { Stateless } from '../../behaviour/common/BehaviourState';

// THIS IS NOT API YET
const dehighlightAllExcept = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, skip: AlloyComponent[]): void => {
  const highlighted = SelectorFilter.descendants(component.element(), '.' + hConfig.highlightClass);
  Arr.each(highlighted, (h) => {
    if (!Arr.exists(skip, (skipComp) => skipComp.element() === h)) {
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
    Class.remove(target.element(), hConfig.highlightClass);
    hConfig.onDehighlight(component, target);
    AlloyTriggers.emit(target, SystemEvents.dehighlight());
  }
};

const highlight = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, target: AlloyComponent): void => {
  dehighlightAllExcept(component, hConfig, hState, [target]);

  if (! isHighlighted(component, hConfig, hState, target)) {
    Class.add(target.element(), hConfig.highlightClass);
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
    throw new Error(err);
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

const isHighlighted = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, queryTarget: AlloyComponent): boolean => {
  return Class.has(queryTarget.element(), hConfig.highlightClass);
};

const getHighlighted = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless): Option<AlloyComponent> => {
  return SelectorFind.descendant(component.element(), '.' + hConfig.highlightClass).bind((e) => component.getSystem().getByDom(e).toOption());
};

const getByIndex = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, index: number): Result<AlloyComponent, string> => {
  const items = SelectorFilter.descendants(component.element(), '.' + hConfig.itemClass);

  return Option.from(items[index]).fold(() => {
    return Result.error<AlloyComponent, any>('No element found with index ' + index);
  }, component.getSystem().getByDom);
};

const getFirst = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless): Option<AlloyComponent> => {
  return SelectorFind.descendant(component.element(), '.' + hConfig.itemClass).bind((e) => component.getSystem().getByDom(e).toOption());
};

const getLast = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless): Option<AlloyComponent> => {
  const items: Element[] = SelectorFilter.descendants(component.element(), '.' + hConfig.itemClass);
  const last = items.length > 0 ? Option.some(items[items.length - 1]) : Option.none<Element<any>>();
  return last.bind((c) => component.getSystem().getByDom(c).toOption());
};

const getDelta = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, delta: number): Option<AlloyComponent> => {
  const items = SelectorFilter.descendants(component.element(), '.' + hConfig.itemClass);
  const current = Arr.findIndex(items, (item) => {
    return Class.has(item, hConfig.highlightClass);
  });

  return current.bind((selected) => {
    const dest = Num.cycleBy(selected, delta, 0, items.length - 1);
    return component.getSystem().getByDom(items[dest]).toOption();
  });
};

const getPrevious = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless): Option<AlloyComponent> => {
  return getDelta(component, hConfig, hState, -1);
};

const getNext = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless): Option<AlloyComponent> => {
  return getDelta(component, hConfig, hState, +1);
};

const getCandidates = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless): AlloyComponent[] => {
  const items = SelectorFilter.descendants(component.element(), '.' + hConfig.itemClass);
  return Options.cat(
    Arr.map(items, (i) => {
      return component.getSystem().getByDom(i).toOption();
    })
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
