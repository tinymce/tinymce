define(
  'ephox.phoenix.api.general.Search',

  [
    'ephox.phoenix.search.Searcher'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Searcher) {
    var run = function (universe, items, patterns) {
      return Searcher.run(universe, items, patterns);
    };

    var safeWords = function (universe, items, words, optimise) {
      return Searcher.safeWords(universe, items, words, optimise);
    };

    var safeToken = function (universe, items, token) {
      return Searcher.safeToken(universe, items, token);
    };

    return {
      safeWords: safeWords,
      safeToken: safeToken,
      run: run
    };

  }
);
