define(
  'ephox.phoenix.api.Split',

  [
    'ephox.phoenix.ghetto.split.GhettoSplit'
  ],

  function (GhettoSplit) {
    return {
      split: GhettoSplit.split,
      splitByPair: GhettoSplit.splitByPair
    };

  }
);
