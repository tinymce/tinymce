define(
  'ephox.phoenix.wrap.DomIdentify',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.ghetto.wrap.GhettoIdentify'
  ],

  function (DomUniverse, GhettoIdentify) {
    var universe = DomUniverse();

    var nodes = function (base, baseOffset, end, endOffset) {
      return GhettoIdentify.nodes(universe, base, baseOffset, end, endOffset);
    };

    return {
      nodes: nodes
    };
  }
);
