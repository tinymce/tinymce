import { DomUniverse } from '@ephox/boss';
import { Element } from '@ephox/sugar';
import { NamedPattern } from '../data/NamedPattern';
import * as Search from '../general/Search';

const universe = DomUniverse();

const run = function (elements: Element[], patterns: NamedPattern[], optimise?: (e: Element) => boolean) {
  return Search.run(universe, elements, patterns, optimise);
};

const safeWords = function (elements: Element[], words: string[], optimise?: (e: Element) => boolean) {
  return Search.safeWords(universe, elements, words, optimise);
};

const safeToken = function (elements: Element[], token: string, optimise?: (e: Element) => boolean) {
  return Search.safeToken(universe, elements, token, optimise);
};

export {
  safeWords,
  safeToken,
  run,
};