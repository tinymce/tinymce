define(
  'ephox.phoenix.ghetto.family.GhettoGroup',

  [
    'ephox.compass.Arr',
    'ephox.phoenix.api.Extract',
    'ephox.phoenix.util.arr.Split'
  ],

  function (Arr, Extract, Split) {
    var group = function (universe, items) {
      var extractions = Arr.bind(items, function (item) {
        return Extract.from(universe, item);
      });

      var segments = Split.split(extractions, function (item) {
        return item.isBoundary();
      });

      return Arr.filter(segments, function (x) { return x.length > 0; });
    };

    return {
      group: group
    };

  }
);
