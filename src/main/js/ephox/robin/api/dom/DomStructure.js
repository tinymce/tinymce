define(
  'ephox.robin.api.dom.DomStructure',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.Structure'
  ],

  function (DomUniverse, Structure) {
    var universe = DomUniverse();

    var isBlock = function (element) {
      return Structure.isBlock(universe, element);
    };

    return {
      isBlock: isBlock
    };
  }
);
