define(
  'ephox.robin.api.dom.DomGrouping',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.Grouping'
  ],

  function (DomUniverse, Grouping) {
    var universe = DomUniverse();
    var text = function (element) {
      return Grouping.text(universe, element);
    };

    return {
      text: text
    };
  }
);
