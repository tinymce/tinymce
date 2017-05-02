define(
  'ephox.alloy.behaviour.highlighting.HighlightApis',

  [
    'ephox.alloy.alien.Cycles',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.search.SelectorFilter',
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (Cycles, Arr, Option, Class, SelectorFilter, SelectorFind) {
    var dehighlightAll = function (component, hConfig, hState) {
      var highlighted = SelectorFilter.descendants(component.element(), '.' + hConfig.highlightClass());
      Arr.each(highlighted, function (h) {
        Class.remove(h, hConfig.highlightClass());
        component.getSystem().getByDom(h).each(function (target) {
          hConfig.onDehighlight()(component, target);
        });
      });
    };

    var dehighlight = function (component, hConfig, hState, target) {
      var wasHighlighted = isHighlighted(component, hConfig, hState, target);
      Class.remove(target.element(), hConfig.highlightClass());

      // Only fire the event if it was highlighted.
      if (wasHighlighted) hConfig.onDehighlight()(component, target);
    };

    var highlight = function (component, hConfig, hState, target) {
      var wasHighlighted = isHighlighted(component, hConfig, hState, target);
      dehighlightAll(component, hConfig, hState);
      Class.add(target.element(), hConfig.highlightClass());
      
      // TODO: Check whether this should always fire
      if (! wasHighlighted) hConfig.onHighlight()(component, target);
    };

    var highlightFirst = function (component, hConfig, hState) {
      getFirst(component, hConfig, hState).each(function (firstComp) {
        highlight(component, hConfig, hState, firstComp);
      });
    };

    var highlightLast = function (component, hConfig, hState) {
      getLast(component, hConfig, hState).each(function (lastComp) {
        highlight(component, hConfig, hState, lastComp);
      });
    };

    var isHighlighted = function (component, hConfig, hState, queryTarget) {
      return Class.has(queryTarget.element(), hConfig.highlightClass());
    };

    var getHighlighted = function (component, hConfig, hState) {
      return SelectorFind.descendant(component.element(), '.' + hConfig.highlightClass()).bind(component.getSystem().getByDom);
    };

    var getFirst = function (component, hConfig, hState) {
      return SelectorFind.descendant(component.element(), '.' + hConfig.itemClass()).bind(component.getSystem().getByDom);
    };

    var getLast = function (component, hConfig, hState) {
      var items = SelectorFilter.descendants(component.element(), '.' + hConfig.itemClass());
      var last = items.length > 0 ? Option.some(items[items.length - 1]) : Option.none();
      return last.bind(component.getSystem().getByDom);
    };

    var getDelta = function (component, hConfig, hState, delta) {
      var items = SelectorFilter.descendants(component.element(), '.' + hConfig.itemClass());
      var current = Arr.findIndex(items, function (item) {
        return Class.has(item, hConfig.highlightClass());
      });

      return current.bind(function (selected) {
        var dest = Cycles.cycleBy(selected, delta, 0, items.length - 1);
        // INVESTIGATE: Are these consistent return types? (Option vs Result)
        return component.getSystem().getByDom(items[dest]);
      });
    };

    var getPrevious = function (component, hConfig, hState) {
      return getDelta(component, hConfig, hState, -1);
    };

    var getNext = function (component, hConfig, hState) {
      return getDelta(component, hConfig, hState, +1);
    };

    return {
      dehighlightAll: dehighlightAll,
      dehighlight: dehighlight,
      highlight: highlight,
      highlightFirst: highlightFirst,
      highlightLast: highlightLast,
      isHighlighted: isHighlighted,
      getHighlighted: getHighlighted,
      getFirst: getFirst,
      getLast: getLast,
      getPrevious: getPrevious,
      getNext: getNext
    };
  }
);