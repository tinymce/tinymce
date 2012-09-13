define(
  'ephox.phoenix.wrap.Identify',

  [
    'ephox.phoenix.split.Split',
    'ephox.phoenix.util.node.Range',
    'ephox.sugar.api.Compare'
  ],

  function (Split, Range, Compare) {

    var diff = function (base, baseOffset, end, endOffset) {
      var start = Split.split(base, baseOffset);
      var finish = Split.split(end, endOffset);
      return Range.range(start.after(), finish.before());
    };

    var same = function (base, baseOffset, end, endOffset) {
      var token = Split.splitByPair(base, baseOffset, endOffset);
      return [token.middle()];
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
