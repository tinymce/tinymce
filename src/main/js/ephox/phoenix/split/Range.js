define(
  'ephox.phoenix.split.Range',

  [
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.family.Range',
    'ephox.phoenix.split.Split'
  ],

  function (Spot, Range, Split) {
    var diff = function (universe, base, baseOffset, end, endOffset) {
      var start = Split.split(universe, base, baseOffset).after().fold(function () {
        return Spot.point(base, 1);
      }, function (after) {
        return Spot.point(after, 0);
      });

      var finish = Split.split(universe, end, endOffset).before().fold(function () {
        return Spot.point(end, 0);
      }, function (before) {
        return Spot.point(before, 1);
      });
      return Range.range(universe, start.element(), start.offset(), finish.element(), finish.offset());
    };

    var same = function (universe, base, baseOffset, end, endOffset) {
      var middle = Split.splitByPair(universe, base, baseOffset, endOffset);
      return [middle];
    };

    var nodes = function (universe, base, baseOffset, end, endOffset) {
      var f = universe.eq(base, end) ? same : diff;
      return f(universe, base, baseOffset, end, endOffset);
    };

    return {
      nodes: nodes
    };

  }
);
