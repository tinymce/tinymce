define(
  'ephox.phoenix.wrap.DomWraps',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.ghetto.wrap.GhettoWraps'
  ],

  function (DomUniverse, GhettoWraps) {
    var universe = DomUniverse();

    var simple = function () {
      return GhettoWraps.simple(universe);
    };

    var basic = function (elem) {
      return GhettoWraps.basic(universe, elem);
    };

    return {
      simple: simple,
      basic: basic
    };
  }
);
