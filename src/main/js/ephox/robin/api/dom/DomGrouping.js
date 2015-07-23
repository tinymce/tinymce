define(
  'ephox.robin.api.dom.DomGrouping',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.Grouping'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (DomUniverse, Grouping) {
    var universe = DomUniverse();
    var text = function (element, optimise) {
      return Grouping.text(universe, element, optimise);
    };

    return {
      text: text
    };
  }
);
