define(
  'ephox.robin.api.dom.DomStructure',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.Structure'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (DomUniverse, Structure) {
    var universe = DomUniverse();

    var isBlock = function (element) {
      return Structure.isBlock(universe, element);
    };

    var isList = function (element) {
      return Structure.isList(universe, element);
    };

    var isFormatting = function (element) {
      return Structure.isFormatting(universe, element);
    };

    var isContainer = function (element) {
      return Structure.isContainer(universe, element);
    };

    var isEmptyTag = function (element) {
      return Structure.isEmptyTag(universe, element);
    };

    return {
      isBlock: isBlock,
      isList: isList,
      isFormatting: isFormatting,
      isContainer: isContainer,
      isEmptyTag: isEmptyTag
    };
  }
);
