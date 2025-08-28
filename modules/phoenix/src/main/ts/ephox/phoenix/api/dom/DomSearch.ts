import { DomUniverse } from '@ephox/boss';
import { SugarElement } from '@ephox/sugar';

import { NamedPattern } from '../data/NamedPattern';
import { SearchResult } from '../data/Types';
import * as Search from '../general/Search';

const universe = DomUniverse();

const run = (elements: SugarElement[], patterns: NamedPattern[], optimise?: (e: SugarElement) => boolean): SearchResult<SugarElement>[] => {
  return Search.run(universe, elements, patterns, optimise);
};

const safeWords = (elements: SugarElement[], words: string[], optimise?: (e: SugarElement) => boolean): SearchResult<SugarElement>[] => {
  return Search.safeWords(universe, elements, words, optimise);
};

const safeToken = (elements: SugarElement[], token: string, optimise?: (e: SugarElement) => boolean): SearchResult<SugarElement>[] => {
  return Search.safeToken(universe, elements, token, optimise);
};

export {
  safeWords,
  safeToken,
  run
};
