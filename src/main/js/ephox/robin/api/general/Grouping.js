define(
  'ephox.robin.api.general.Grouping',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.api.general.Extract',
    'ephox.polaris.api.Arrays'
  ],

  function (Arr, Fun, Extract, Arrays) {
    var text = function (universe, element) {
      // Used in phoenix, but phoenix doesn't split on empty
      var extractions = Extract.from(universe, element);
      var segments = Arrays.splitby(extractions, function (x) {
        return x.fold(Fun.constant(true), Fun.constant(true), Fun.constant(false));
      });

      return Arr.map(segments, function (x) {
        return Arr.bind(x, function (y) {
          return y.toText().fold(Fun.constant([]), function (v) {
            return [v];
          });
        });
      });
    };

    return {
      text: text
    };
  }
);
