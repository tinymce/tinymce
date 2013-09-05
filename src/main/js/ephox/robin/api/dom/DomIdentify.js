define(
  'ephox.robin.api.dom.DomIdentify',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.peanut.Fun',
    'ephox.robin.api.general.Identify'
  ],

  function (DomUniverse, Fun, Identify) {
    var universe = DomUniverse();

    var isBlock = Fun.curry(Identify.isBlock, universe);

    return {
      isBlock: isBlock
    };
  }
);
