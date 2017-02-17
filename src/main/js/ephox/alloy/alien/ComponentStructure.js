define(
  'ephox.alloy.alien.ComponentStructure',

  [
    'ephox.alloy.aria.AriaOwner',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.search.PredicateExists'
  ],

  function (AriaOwner, Fun, Compare, PredicateExists) {
    var isAriaPartOf = function (component, queryElem) {
      return AriaOwner.find(queryElem).exists(function (owner) {
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