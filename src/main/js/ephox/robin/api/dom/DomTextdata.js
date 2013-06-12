define(
  'ephox.robin.api.dom.DomTextdata',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.Textdata'
  ],

  function (DomUniverse, Textdata) {
    var universe = DomUniverse();

    var from = function (elements, current, offset) {
      return Textdata.from(universe, elements, current, offset);
    };

    return {
      from: from
    };
  }
);
