define(
  'ephox.phoenix.api.general.Search',

  [
    'ephox.phoenix.search.Searcher'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Searcher) {
    var run = function (universe, items, patterns, optimise, flags) {
      return Searcher.run(universe, items, patterns, optimise, flags);
    };

    var safeWords = function (universe, items, words, optimise, flags) {
      return Searcher.safeWords(universe, items, words, optimise, flags);
    };

    var safeToken = function (universe, items, token, optimise, flags) {
      return Searcher.safeToken(universe, items, token, optimise, flags);
    };

    return {
      safeWords: safeWords,
      safeToken: safeToken,
      run: run
    };

  }
);
