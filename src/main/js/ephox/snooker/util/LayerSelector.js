define(
  'ephox.snooker.util.LayerSelector',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.syrup.api.Selectors',
    'ephox.syrup.api.Traverse'
  ],

  function (Arr, Fun, Selectors, Traverse) {
    var firstLayer = function (scope, selector) {
      return filterFirstLayer(scope, selector, Fun.constant(true));
    };

    var filterFirstLayer = function (scope, selector, predicate) {
      return Arr.bind(Traverse.children(scope), function (x) {
        return Selectors.is(x, selector) ?
          predicate(x) ? [ x ] : [ ]
          : filterFirstLayer(x, selector, predicate);
      });
    };

    return {
      firstLayer: firstLayer,
      filterFirstLayer: filterFirstLayer
    };
  }
);