define(
  'ephox.phoenix.ghetto.family.GhettoGroup',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.api.Extract',
    'ephox.polaris.api.Arrays'
  ],

  function (Arr, Extract, Arrays) {
    var group = function (universe, items) {
      var extractions = Arr.bind(items, function (item) {
        return Extract.from(universe, item);
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
