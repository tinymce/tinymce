define(
  'ephox.alloy.behaviour.Highlighting',

  [
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

  function (Behaviour, DomModification, FieldPresence, FieldSchema, ValueSchema, Arr, Fun, Option, Class, SelectorFilter, SelectorFind) {
    var schema = FieldSchema.field(
      'highlighting',
      'highlighting',
      FieldPresence.asOption(),
      ValueSchema.objOf([
        FieldSchema.strict('highlightClass'),
        FieldSchema.strict('itemClass')
      ])
    );

    var exhibit = function (info, base) {
      return DomModification.nu({ });
    };

    var dehighlightAll = function (component, hInfo) {
      var highlighted = SelectorFilter.descendants(component.element(), '.' + hInfo.highlightClass());
      Arr.each(highlighted, function (h) {
        Class.remove(h, hInfo.highlightClass());
      });
    };

    var dehighlight = function (component, hInfo, target) {
      Class.remove(target, hInfo.highlightClass());
    };

    var highlight = function (component, hInfo, target) {
      dehighlightAll(component, hInfo);
      Class.add(target, hInfo.highlightClass());
    };

    var highlightFirst = function (component, hInfo) {
      getFirst(component, hInfo).each(function (firstComp) {
        highlight(component, hInfo, firstComp.element());
      });
    };

    var highlightLast = function (component, hInfo) {
      getLast(component, hInfo).each(function (lastComp) {
        highlight(component, hInfo, lastComp.element());
      });
    };

    var isHighlighted = function (component, hInfo, queryTarget) {
      return Class.has(queryTarget, hInfo.highlightClass());
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
        getLast: Behaviour.tryActionOpt('highlighting', info, 'getLast', getLast)
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