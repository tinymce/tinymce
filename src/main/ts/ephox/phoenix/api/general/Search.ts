import Searcher from '../../search/Searcher';

var run = function (universe, items, patterns, optimise?) {
  return Searcher.run(universe, items, patterns, optimise);
};

var safeWords = function (universe, items, words, optimise?) {
  return Searcher.safeWords(universe, items, words, optimise);
};

var safeToken = function (universe, items, token, optimise?) {
  return Searcher.safeToken(universe, items, token, optimise);
};

export default {
  safeWords,
  safeToken,
  run,
};