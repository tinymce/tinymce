define(
  'ephox.robin.api.dom.DomLeftBlock',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.LeftBlock'
  ],

  /**
   * Documentation is in the actual implementations.
   */
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
