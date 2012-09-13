define(
  'ephox.phoenix.split.Split',

  [
    'ephox.phoenix.data.TextSplit',
    'ephox.phoenix.util.node.Split',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Text'
  ],

  function (TextSplit, Split, InsertAll, Text) {

    var domSplit = function (element, newValue, nodes) {
      Text.set(element, newValue);
      InsertAll.after(element, nodes);
    };

    var splitByPair = function (element, start, end) {
      var info = Split.splitByPair(element, start, end);
      var nodes = [info.split()].concat(info.extra());
      domSplit(element, info.newValue(), nodes);
      return TextSplit.trisect(element, info.split(), info.extra()[0]);
    };

    var split = function (element, position) {
      var info = Split.split(element, position);
      var nodes = [info.after()];
      domSplit(element, info.newValue(), nodes);
      return TextSplit.bisect(element, info.after());
    };

    return {
      splitByPair: splitByPair,
      split: split
    };

  }
);
