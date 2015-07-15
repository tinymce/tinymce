define(
  'ephox.phoenix.api.general.Search',

  [
    'ephox.phoenix.search.Searcher'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Searcher) {
    var run = function (universe, items, patterns, optimise) {
      return Searcher.run(universe, items, patterns, optimise);
    };

    var safeWords = function (universe, items, words, optimise) {
      return Searcher.safeWords(universe, items, words, optimise);
    };

    var safeToken = function (universe, items, token, optimise) {
      return Searcher.safeToken(universe, items, token, optimise);
    };

    return {
      safeWords: safeWords,
      safeToken: safeToken,
      run: run
    };

  }
);
