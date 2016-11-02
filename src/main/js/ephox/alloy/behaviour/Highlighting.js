define(
  'ephox.alloy.behaviour.Highlighting',

  [
    'ephox.alloy.alien.Cycles',
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind'
  ],

  function (Cycles, Behaviour, DomModification, FieldPresence, FieldSchema, ValueSchema, Arr, Fun, Option, Class, SelectorFilter, SelectorFind) {
    var schema = FieldSchema.field(
      'highlighting',
      'highlighting',
      FieldPresence.asOption(),
      ValueSchema.objOf([
        FieldSchema.strict('highlightClass'),
        FieldSchema.strict('itemClass'),

        FieldSchema.defaulted('onHighlight', Fun.noop),
        FieldSchema.defaulted('onDehighlight', Fun.noop)
      ])
    );

    var exhibit = function (info, base) {
      return DomModification.nu({ });
    };

    var dehighlightAll = function (component, hInfo) {
      var highlighted = SelectorFilter.descendants(component.element(), '.' + hInfo.highlightClass());
      Arr.each(highlighted, function (h) {
        Class.remove(h, hInfo.highlightClass());
        component.getSystem().getByDom(h).each(function (target) {
          hInfo.onDehighlight()(component, target);
        });
      });
    };

    var dehighlight = function (component, hInfo, target) {
      Class.remove(target.element(), hInfo.highlightClass());
      hInfo.onDehighlight()(component, target);
    };

    var highlight = function (component, hInfo, target) {
      dehighlightAll(component, hInfo);
      Class.add(target.element(), hInfo.highlightClass());
      hInfo.onHighlight()(component, target);
    };

    var highlightFirst = function (component, hInfo) {
      getFirst(component, hInfo).each(function (firstComp) {
        highlight(component, hInfo, firstComp);
      });
    };

    var highlightLast = function (component, hInfo) {
      getLast(component, hInfo).each(function (lastComp) {
        highlight(component, hInfo, lastComp);
      });
    };

    var isHighlighted = function (component, hInfo, queryTarget) {
      return Class.has(queryTarget.element(), hInfo.highlightClass());
    };

    var getHighlighted = function (component, hInfo) {
      return SelectorFind.descendant(component.element(), '.' + hInfo.highlightClass()).bind(component.getSystem().getByDom);
    };

    var getFirst = function (component, hInfo) {
      return SelectorFind.descendant(component.element(), '.' + hInfo.itemClass()).bind(component.getSystem().getByDom);
    };

    var getLast = function (component, hInfo) {
      var items = SelectorFilter.descendants(component.element(), '.' + hInfo.itemClass());
      var last = items.length > 0 ? Option.some(items[items.length - 1]) : Option.none();
      return last.bind(component.getSystem().getByDom);
    };

    var getDelta = function (component, hInfo, delta) {
      var items = SelectorFilter.descendants(component.element(), '.' + hInfo.itemClass());
      var selected = Arr.findIndex(items, function (item) {
        return Class.has(item, hInfo.highlightClass());
      });
      if (selected === -1) return Option.none();
      var dest = Cycles.cycleBy(selected, delta, 0, items.length - 1);
      return component.getSystem().getByDom(items[dest]);
    };

    var getPrevious = function (component, hInfo) {
      return getDelta(component, hInfo, -1);
    };

    var getNext = function (component, hInfo) {
      return getDelta(component, hInfo, +1);
    };

    var apis = function (info) {
      return {
        highlight: Behaviour.tryActionOpt('highlighting', info, 'highlight', highlight),
        dehighlight: Behaviour.tryActionOpt('highlighting', info, 'dehighlight', dehighlight),
        dehighlightAll: Behaviour.tryActionOpt('highlighting', info, 'dehighlightAll', dehighlightAll),
        highlightFirst: Behaviour.tryActionOpt('highlighting', info, 'highlight', highlightFirst),
        highlightLast: Behaviour.tryActionOpt('highlighting', info, 'highlight', highlightLast),
        isHighlighted: Behaviour.tryActionOpt('highlighting', info, 'isHighlighted', isHighlighted),
        getHighlighted: Behaviour.tryActionOpt('highlighting', info, 'getHighlighted', getHighlighted),
        getFirst: Behaviour.tryActionOpt('highlighting', info, 'getFirst', getFirst),
        getLast: Behaviour.tryActionOpt('highlighting', info, 'getLast', getLast),
        getPrevious: Behaviour.tryActionOpt('highlighting', info, 'getPrevious', getPrevious),
        getNext: Behaviour.tryActionOpt('highlighting', info, 'getNext', getNext)
      };
    };

    return Behaviour.contract({
      name: Fun.constant('highlighting'),
      exhibit: exhibit,
      handlers: Fun.constant({ }),
      apis: apis,
      schema: Fun.constant(schema)
    });
  }
);