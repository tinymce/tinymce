import { Arr, Option, Options, Result } from '@ephox/katamari';
import { Class, SelectorFilter, SelectorFind } from '@ephox/sugar';

import * as Cycles from '../../alien/Cycles';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { HighlightingConfig } from '../../behaviour/highlighting/HighlightingTypes';
import { Stateless } from '../../behaviour/common/BehaviourState';
import { SugarElement } from '../../alien/TypeDefinitions';

const dehighlightAll = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless): void => {
  const highlighted = SelectorFilter.descendants(component.element(), '.' + hConfig.highlightClass());
  Arr.each(highlighted, (h) => {
    Class.remove(h, hConfig.highlightClass());
    component.getSystem().getByDom(h).each((target) => {
      hConfig.onDehighlight()(component, target);
    });
  });
};

const dehighlight = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, target: AlloyComponent): void => {
  const wasHighlighted = isHighlighted(component, hConfig, hState, target);
  Class.remove(target.element(), hConfig.highlightClass());

  // Only fire the event if it was highlighted.
  if (wasHighlighted) { hConfig.onDehighlight()(component, target); }
};

const highlight = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, target: AlloyComponent): void => {
  const wasHighlighted = isHighlighted(component, hConfig, hState, target);
  dehighlightAll(component, hConfig, hState);
  Class.add(target.element(), hConfig.highlightClass());

  // TODO: Check whether this should always fire
  if (! wasHighlighted) { hConfig.onHighlight()(component, target); }
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

const highlightAt = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, index): void => {
  getByIndex(component, hConfig, hState, index).fold((err) => {
    throw new Error(err);
  }, (firstComp) => {
    highlight(component, hConfig, hState, firstComp);
  });
};

const highlightBy = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, predicate: (AlloyComponent) => boolean): void => {
  const items = SelectorFilter.descendants(component.element(), '.' + hConfig.itemClass());
  const itemComps = Options.cat(
    Arr.map(items, (i) => {
      return component.getSystem().getByDom(i).toOption();
    })
  );
  const targetComp = Arr.find(itemComps, predicate);
  targetComp.each((c) => {
    highlight(component, hConfig, hState, c);
  });
};

const isHighlighted = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, queryTarget: AlloyComponent): boolean => {
  return Class.has(queryTarget.element(), hConfig.highlightClass());
};

const getHighlighted = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless): Option<AlloyComponent> => {
  return SelectorFind.descendant(component.element(), '.' + hConfig.highlightClass()).bind((e) => component.getSystem().getByDom(e).toOption());
};

const getByIndex = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, index: number): Result<AlloyComponent, string> => {
  const items = SelectorFilter.descendants(component.element(), '.' + hConfig.itemClass());

  return Option.from(items[index]).fold(() => {
    return Result.error('No element found with index ' + index);
  }, component.getSystem().getByDom);
};

const getFirst = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless): Option<AlloyComponent> => {
  return SelectorFind.descendant(component.element(), '.' + hConfig.itemClass()).bind((e) => component.getSystem().getByDom(e).toOption());
};

const getLast = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless): Option<AlloyComponent> => {
  const items: SugarElement[] = SelectorFilter.descendants(component.element(), '.' + hConfig.itemClass());
  const last = items.length > 0 ? Option.some(items[items.length - 1]) : Option.none();
  return last.bind((c) => component.getSystem().getByDom(c).toOption());
};

const getDelta = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless, delta: number): Option<AlloyComponent> => {
  const items = SelectorFilter.descendants(component.element(), '.' + hConfig.itemClass());
  const current = Arr.findIndex(items, (item) => {
    return Class.has(item, hConfig.highlightClass());
  });

  return current.bind((selected) => {
    const dest = Cycles.cycleBy(selected, delta, 0, items.length - 1);
    return component.getSystem().getByDom(items[dest]).toOption();
  });
};

const getPrevious = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless): Option<AlloyComponent> => {
  return getDelta(component, hConfig, hState, -1);
};

const getNext = (component: AlloyComponent, hConfig: HighlightingConfig, hState: Stateless): Option<AlloyComponent> => {
  return getDelta(component, hConfig, hState, +1);
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
  getNext
};