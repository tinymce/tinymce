define(
  'ephox.phoenix.api.general.Split',

  [
    'ephox.phoenix.search.Splitter',
    'ephox.phoenix.split.Range',
    'ephox.phoenix.split.Split'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Splitter, Range, Split) {
    var split = function (universe, item, position) {
      return Split.split(universe, item, position);
    };

    var splitByPair = function (universe, item, start, finish) {
      return Split.splitByPair(universe, item, start, finish);
    };

    var range = function (universe, start, startOffset, finish, finishOffset) {
      return Range.nodes(universe, start, startOffset, finish, finishOffset);
    };

    var subdivide = function (universe, item, positions) {
      return Splitter.subdivide(universe, item, positions);
    };

    return {
      split: split,
      splitByPair: splitByPair,
      range: range,
      subdivide: subdivide
    };
  }
);
