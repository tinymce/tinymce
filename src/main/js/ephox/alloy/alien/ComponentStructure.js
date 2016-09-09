define(
  'ephox.alloy.alien.ComponentStructure',

  [
    'ephox.peanut.Fun',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.PredicateExists'
  ],

  function (Fun, Compare, PredicateExists) {
    var isPartOf = function (component, queryElem) {
      return PredicateExists.closest(queryElem, function (el) {
        return Compare.eq(el, component.element());
      }, Fun.constant(false));  
    };

    return {
      isPartOf: isPartOf
    };
  }
);