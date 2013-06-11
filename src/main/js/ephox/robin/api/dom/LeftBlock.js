define(
  'ephox.robin.api.dom.LeftBlock',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.LeftBlock'
  ],

  function (DomUniverse, LeftBlock) {
    var universe = DomUniverse();

    var top = function (item) {
      return LeftBlock.top(universe, item);
    };

    var all = function (item) {
      return LeftBlock.all(universe, item);
    };

    return {
      top: top,
      all: all
    };
  }
);
