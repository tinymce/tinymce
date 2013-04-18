define(
  'ephox.robin.api.Grouping',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.extract.Extract',
    'ephox.phoenix.util.arr.Split'
  ],

  function (Arr, Fun, Extract, Split) {
    var text = function (element) {
      // Used in phoenix, but phoenix doesn't split on empty
      var extractions = Extract.from(element);
      var segments = Split.split(extractions, function (x) {
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
