define(
  'ephox.alloy.alien.ComponentStructure',

  [
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.PredicateExists'
  ],

  function (Compare, PredicateExists) {
    var isPartOf = function (component, queryElem) {
      return PredicateExists.closest(queryElem, function (el) {
        return Compare.eq(el, component.element());
      }, function (el) {
        return Compare.eq(el, component.element());
      });  
    };

    return {
      isPartOf: isPartOf
    };
  }
);