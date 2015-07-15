define(
  'ephox.phoenix.api.dom.DomSearch',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.api.general.Search'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (DomUniverse, Search) {
    var universe = DomUniverse();

    var run = function (elements, patterns, optimise) {
      return Search.run(universe, elements, patterns, optimise);
    };

    var safeWords = function (elements, words, optimise) {
      return Search.safeWords(universe, elements, words, optimise);
    };

    var safeToken = function (elements, token, optimise) {
      return Search.safeToken(universe, elements, token, optimise);
    };

    return {
      safeWords: safeWords,
      safeToken: safeToken,
      run: run
    };

  }
);
