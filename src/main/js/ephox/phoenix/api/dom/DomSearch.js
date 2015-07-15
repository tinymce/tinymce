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

    var run = function (elements, patterns) {
      return Search.run(universe, elements, patterns);
    };

    var safeWords = function (elements, words, optimise) {
      return Search.safeWords(universe, elements, words, optimise);
    };

    var safeToken = function (elements, token) {
      return Search.safeToken(universe, elements, token);
    };

    return {
      safeWords: safeWords,
      safeToken: safeToken,
      run: run
    };

  }
);
