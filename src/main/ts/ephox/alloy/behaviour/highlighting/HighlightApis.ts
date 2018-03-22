import { Arr, Option, Options, Result } from '@ephox/katamari';
import { Class, SelectorFilter, SelectorFind } from '@ephox/sugar';

import * as Cycles from '../../alien/Cycles';

const dehighlightAll = function (component, hConfig, hState) {
  const highlighted = SelectorFilter.descendants(component.element(), '.' + hConfig.highlightClass());
  Arr.each(highlighted, function (h) {
    Class.remove(h, hConfig.highlightClass());
    component.getSystem().getByDom(h).each(function (target) {
      hConfig.onDehighlight()(component, target);
    });
  });
};

const dehighlight = function (component, hConfig, hState, target) {
  const wasHighlighted = isHighlighted(component, hConfig, hState, target);
  Class.remove(target.element(), hConfig.highlightClass());

  // Only fire the event if it was highlighted.
  if (wasHighlighted) { hConfig.onDehighlight()(component, target); }
};

const highlight = function (component, hConfig, hState, target) {
  const wasHighlighted = isHighlighted(component, hConfig, hState, target);
  dehighlightAll(component, hConfig, hState);
  Class.add(target.element(), hConfig.highlightClass());

  // TODO: Check whether this should always fire
  if (! wasHighlighted) { hConfig.onHighlight()(component, target); }
};

const highlightFirst = function (component, hConfig, hState) {
  getFirst(component, hConfig, hState).each(function (firstComp) {
    highlight(component, hConfig, hState, firstComp);
  });
};

const highlightLast = function (component, hConfig, hState) {
  getLast(component, hConfig, hState).each(function (lastComp) {
    highlight(component, hConfig, hState, lastComp);
  });
};

const highlightAt = function (component, hConfig, hState, index) {
  getByIndex(component, hConfig, hState, index).fold(function (err) {
    throw new Error(err);
  }, function (firstComp) {
    highlight(component, hConfig, hState, firstComp);
  });
};

const highlightBy = function (component, hConfig, hState, predicate) {
  const items = SelectorFilter.descendants(component.element(), '.' + hConfig.itemClass());
  const itemComps = Options.cat(
    Arr.map(items, function (i) {
      return component.getSystem().getByDom(i).toOption();
    })
  );
  const targetComp = Arr.find(itemComps, predicate);
  targetComp.each(function (c) {
    highlight(component, hConfig, hState, c);
  });
};

const isHighlighted = function (component, hConfig, hState, queryTarget) {
  return Class.has(queryTarget.element(), hConfig.highlightClass());
};

const getHighlighted = function (component, hConfig, hState) {
  // FIX: Wrong return type (probably)
  return SelectorFind.descendant(component.element(), '.' + hConfig.highlightClass()).bind(component.getSystem().getByDom);
};

const getByIndex = function (component, hConfig, hState, index) {
  const items = SelectorFilter.descendants(component.element(), '.' + hConfig.itemClass());

  return Option.from(items[index]).fold(function () {
    return Result.error('No element found with index ' + index);
  }, component.getSystem().getByDom);
};

const getFirst = function (component, hConfig, hState) {
  // FIX: Wrong return type (probably)
  return SelectorFind.descendant(component.element(), '.' + hConfig.itemClass()).bind(component.getSystem().getByDom);
};

const getLast = function (component, hConfig, hState) {
  const items = SelectorFilter.descendants(component.element(), '.' + hConfig.itemClass());
  const last = items.length > 0 ? Option.some(items[items.length - 1]) : Option.none();
  return last.bind(component.getSystem().getByDom);
};

const getDelta = function (component, hConfig, hState, delta) {
  const items = SelectorFilter.descendants(component.element(), '.' + hConfig.itemClass());
  const current = Arr.findIndex(items, function (item) {
    return Class.has(item, hConfig.highlightClass());
  });

  return current.bind(function (selected) {
    const dest = Cycles.cycleBy(selected, delta, 0, items.length - 1);
    // INVESTIGATE: Are these consistent return types? (Option vs Result)
    return component.getSystem().getByDom(items[dest]);
  });
};

const getPrevious = function (component, hConfig, hState) {
  return getDelta(component, hConfig, hState, -1);
};

const getNext = function (component, hConfig, hState) {
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