define(
  'ephox.phoenix.util.node.DomParents',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.ghetto.family.GhettoParents'
  ],

  function (DomUniverse, GhettoParents) {
    var universe = DomUniverse();

    var common = function (e1, e2) {
      return GhettoParents.common(universe, e1, e2);
    };

    return {
      common: common
    };
  }
);
