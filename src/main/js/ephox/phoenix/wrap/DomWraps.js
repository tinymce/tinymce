define(
  'ephox.phoenix.wrap.DomWraps',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.ghetto.wrap.GhettoWraps'
  ],

  function (DomUniverse, GhettoWraps) {
    var universe = DomUniverse();

    return function (element) {
      return GhettoWraps(universe, element);
    };
  }
);
