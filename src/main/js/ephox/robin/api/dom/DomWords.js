define(
  'ephox.robin.api.dom.DomWords',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.Words',
    'global!Error'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (DomUniverse, Words, Error) {
    var universe = DomUniverse();

    var identify = function (allText) {
      return Words.identify(allText);
    };

    var cluster = function (element, optimise) {
      throw new Error('Should not be calling cluster from DomWords any more');
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
