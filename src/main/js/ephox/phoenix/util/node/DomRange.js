define(
  'ephox.phoenix.util.node.DomRange',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.family.Range'
  ],

  function (DomUniverse, Range) {
    var universe = DomUniverse();

    var range = function (e1, e2) {
      return Range.range(universe, e1.element(), e1.offset(), e2.element(), e2.offset());
    };

    return {
      range: range
    };

  }
);
