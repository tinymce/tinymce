define(
  'ephox.snooker.util.LayerSelector',

  [
    'ephox.compass.Arr',
    'ephox.sugar.api.Selectors',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Selectors, Traverse) {
    var firstLayer = function (scope, selector) {
      return Arr.bind(Traverse.children(scope), function (x) {
        return Selectors.is(x, selector) ? [ x ] : firstLayer(x, selector);
      });
    };

    return {
      firstLayer: firstLayer
    };
  }
);