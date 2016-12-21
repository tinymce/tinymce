define(
  'ephox.alloy.alien.ComponentStructure',

  [
    'ephox.peanut.Fun',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.PredicateExists',
    'ephox.sugar.api.PredicateFind',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse'
  ],

  function (Fun, Attr, Compare, Node, PredicateExists, PredicateFind, SelectorFind, Traverse) {
    var isAriaPartOf = function (component, queryElem) {
      var dependent = PredicateFind.closest(queryElem, function (elem) {
        if (! Node.isElement(elem)) return false;
        var id = Attr.get(elem, 'id');
        return id !== undefined && id.indexOf('aria-owns') > -1;
      });

      return dependent.bind(function (dep) {
        var id = Attr.get(dep, 'id');
        var doc = Traverse.owner(dep);

        // FIX: Put in a common place.
        return SelectorFind.descendant(doc, '[aria-owns="' + id + '"]');
      }).exists(function (owner) {
        return isPartOf(component, owner);
      });
    };

    var isPartOf = function (component, queryElem) {
      return PredicateExists.closest(queryElem, function (el) {
        return Compare.eq(el, component.element());
      }, Fun.constant(false)) || isAriaPartOf(component, queryElem);  
    };

    var isPartOfAnchor = function (anchor, queryElem) {
      return anchor.anchor === 'hotspot' && isPartOf(anchor.hotspot, queryElem);
    };

    return {
      isPartOf: isPartOf,
      isPartOfAnchor: isPartOfAnchor
    };
  }
);