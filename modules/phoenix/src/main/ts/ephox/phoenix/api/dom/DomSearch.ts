import { DomUniverse } from '@ephox/boss';
import { SugarElement } from '@ephox/sugar';
import { NamedPattern } from '../data/NamedPattern';
import * as Search from '../general/Search';

const universe = DomUniverse();

const run = function (elements: SugarElement[], patterns: NamedPattern[], optimise?: (e: SugarElement) => boolean) {
  return Search.run(universe, elements, patterns, optimise);
};

const safeWords = function (elements: SugarElement[], words: string[], optimise?: (e: SugarElement) => boolean) {
  return Search.safeWords(universe, elements, words, optimise);
};

const safeToken = function (elements: SugarElement[], token: string, optimise?: (e: SugarElement) => boolean) {
  return Search.safeToken(universe, elements, token, optimise);
};

export {
  safeWords,
  safeToken,
  run
};
