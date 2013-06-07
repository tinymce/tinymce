define(
  'ephox.phoenix.ghetto.wrap.GhettoIdentify',

  [
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.ghetto.family.GhettoRange',
    'ephox.phoenix.ghetto.split.GhettoSplit'
  ],

  function (Spot, GhettoRange, GhettoSplit) {
    var diff = function (universe, base, baseOffset, end, endOffset) {
      var start = GhettoSplit.split(universe, base, baseOffset).after().fold(function () {
        return Spot.point(base, 1);
      }, function (after) {
        return Spot.point(after, 0);
      });

      var finish = GhettoSplit.split(universe, end, endOffset).before().fold(function () {
        return Spot.point(end, 0);
      }, function (before) {
        return Spot.point(before, 1);
      });
      return GhettoRange.range(universe, start.element(), start.offset(), finish.element(), finish.offset());
    };

    var same = function (universe, base, baseOffset, end, endOffset) {
      var middle = GhettoSplit.splitByPair(universe, base, baseOffset, endOffset);
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
