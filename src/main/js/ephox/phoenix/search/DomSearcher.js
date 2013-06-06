define(
  'ephox.phoenix.search.DomSearcher',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.ghetto.search.GhettoSearcher'
  ],

  function (DomUniverse, GhettoSearcher) {
    var universe = DomUniverse();

    var run = function (elements, patterns) {
      return GhettoSearcher.run(universe, elements, patterns);
    };

    var safeWords = function (elements, words) {
      return GhettoSearcher.safeWords(universe, elements, words);
    };

    var safeToken = function (elements, token) {
      return GhettoSearcher.safeToken(universe, elements, token);
    };

    return {
      safeWords: safeWords,
      safeToken: safeToken,
      run: run
    };
  }
);
