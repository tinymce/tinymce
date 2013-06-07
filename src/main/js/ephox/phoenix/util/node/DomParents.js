define(
  'ephox.phoenix.util.node.DomParents',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.family.Parents'
  ],

  function (DomUniverse, Parents) {
    var universe = DomUniverse();

    var common = function (e1, e2) {
      return Parents.common(universe, e1, e2);
    };

    return {
      common: common
    };
  }
);
