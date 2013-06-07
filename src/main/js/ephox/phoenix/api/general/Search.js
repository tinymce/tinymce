define(
  'ephox.phoenix.api.general.Search',

  [
    'ephox.phoenix.search.Searcher'
  ],

  function (Searcher) {
    var run = function (universe, items, patterns) {
      return Searcher.run(universe, items, patterns);
    };

    var safeWords = function (universe, items, words) {
      return Searcher.safeWords(universe, items, words);
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
