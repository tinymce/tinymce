define(
  'ephox.phoenix.wrap.Identify',

  [
    'ephox.phoenix.api.DomSplit',
    'ephox.phoenix.util.node.Range',
    'ephox.scullion.Struct',
    'ephox.sugar.api.Compare'
  ],

  function (DomSplit, Range, Struct, Compare) {

    // FIX: Rename me.
    var zz = Struct.immutable('element', 'offset');

    var diff = function (base, baseOffset, end, endOffset) {
      var start = DomSplit.split(base, baseOffset).after().fold(function () {
        return zz(base, 1);
      }, function (v) {
        return zz(v, 0);
      });

      var finish = DomSplit.split(end, endOffset).before().fold(function () {
        return zz(end, 0);
      }, function (v) {
        return zz(v, 1);
      });
      return Range.range(start, finish);
    };

    var same = function (base, baseOffset, end, endOffset) {
      var middle = DomSplit.splitByPair(base, baseOffset, endOffset);
      return [middle];
    };

    var nodes = function (base, baseOffset, end, endOffset, c) {
      var f = Compare.eq(base, end) ? same : diff;
      return f(base, baseOffset, end, endOffset);
    };

    return {
      nodes: nodes
    };
  }
);
