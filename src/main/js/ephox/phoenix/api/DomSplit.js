define(
  'ephox.phoenix.api.DomSplit',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.api.Split'
  ],

  function (DomUniverse, Split) {
    var universe = DomUniverse();

    var split = function (element, position) {
      return Split.split(universe, element, position);
    };

    var splitByPair = function (element, start, finish) {
      return Split.splitByPair(universe, element, start, finish);
    };

    return {
      split: split,
      splitByPair: splitByPair
    };
  }
);
