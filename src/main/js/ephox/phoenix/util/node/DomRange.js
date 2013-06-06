define(
  'ephox.phoenix.util.node.DomRange',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.ghetto.family.GhettoRange'
  ],

  function (DomUniverse, GhettoRange) {
    var universe = DomUniverse();

    var range = function (e1, e2) {
      return GhettoRange.range(universe, e1.element(), e1.offset(), e2.element(), e2.offset());
    };

    return {
      range: range
    };

  }
);
