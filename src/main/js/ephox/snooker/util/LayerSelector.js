define(
  'ephox.snooker.util.LayerSelector',

  [
    'ephox.compass.Arr',
    'ephox.sugar.api.Selectors',
    'ephox.sugar.api.Traverse'
  ],

  function (Arr, Selectors, Traverse) {
    var firstLayer = function (scope, selector) {
      var result = [];

      Arr.each(Traverse.children(scope), function (x) {
        if (Selectors.is(x, selector)) {
          result = result.concat([ x ]);
        } else {
          result = result.concat(firstLayer(x, selector));
        }
      });

      return result;
    };

    return {
      firstLayer: firstLayer
    };
  }
);