define(
  'ephox.phoenix.split.Split',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.peanut.Fun',
    'ephox.phoenix.ghetto.split.GhettoSplit'
  ],

  function (DomUniverse, Fun, GhettoSplit) {
    var universe = DomUniverse();

    return {
      split: Fun.curry(GhettoSplit.split, universe),
      splitByPair: Fun.curry(GhettoSplit.splitByPair, universe)
    };
  }
);
