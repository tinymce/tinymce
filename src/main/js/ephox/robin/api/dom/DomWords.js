define(
  'ephox.robin.api.dom.DomWords',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.Words'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (DomUniverse, Words) {
    var universe = DomUniverse();

    var identify = function (allText) {
      return Words.identify(allText);
    };

    var cluster = function (element, optimise) {
      return Words.cluster(universe, element, optimise);
    };

    var isWord = function (text) {
      return Words.isWord(universe, text);
    };

    return {
      identify: identify,
      cluster: cluster,
      isWord: isWord
    };

  }
);
