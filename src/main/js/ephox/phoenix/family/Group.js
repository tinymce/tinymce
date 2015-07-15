define(
  'ephox.phoenix.family.Group',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.api.general.Extract',
    'ephox.polaris.api.Arrays'
  ],

  function (Arr, Extract, Arrays) {
    /**
     * Return an array of arrays split by boundaries
     */
    var group = function (universe, items, optimise) {
      var extractions = Arr.bind(items, function (item) {
        return Extract.from(universe, item, optimise);
      });

      var segments = Arrays.splitby(extractions, function (item) {
        return item.isBoundary();
      });

      return Arr.filter(segments, function (x) { return x.length > 0; });
    };

    return {
      group: group
    };

  }
);
