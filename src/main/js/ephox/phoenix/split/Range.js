define(
  'ephox.phoenix.split.Range',

  [
    'ephox.phoenix.api.data.Spot',
    'ephox.phoenix.api.general.Family',
    'ephox.phoenix.split.Split'
  ],

  function (Spot, Family, Split) {
    var diff = function (universe, base, baseOffset, end, endOffset) {
      var start = Split.split(universe, base, baseOffset).after().fold(function () {
        return Spot.delta(base, 1);
      }, function (after) {
        return Spot.delta(after, 0);
      });

      var finish = Split.split(universe, end, endOffset).before().fold(function () {
        return Spot.delta(end, 0);
      }, function (before) {
        return Spot.delta(before, 1);
      });
      return Family.range(universe, start.element(), start.deltaOffset(), finish.element(), finish.deltaOffset());
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
