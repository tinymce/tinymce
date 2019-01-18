import { DomUniverse } from '@ephox/boss';
import Search from '../general/Search';

var universe = DomUniverse();

var run = function (elements, patterns, optimise?) {
  return Search.run(universe, elements, patterns, optimise);
};

var safeWords = function (elements, words, optimise?) {
  return Search.safeWords(universe, elements, words, optimise);
};

var safeToken = function (elements, token, optimise?) {
  return Search.safeToken(universe, elements, token, optimise);
};

export default {
  safeWords,
  safeToken,
  run,
};