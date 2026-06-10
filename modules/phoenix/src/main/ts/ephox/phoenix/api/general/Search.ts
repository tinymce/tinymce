import type { Universe } from '@ephox/boss';

import * as Searcher from '../../search/Searcher';
import type { NamedPattern } from '../data/NamedPattern';
import type { SearchResult } from '../data/Types';

type RunApi = <E, D>(universe: Universe<E, D>, elements: E[], patterns: NamedPattern[], optimise?: (e: E) => boolean) => SearchResult<E>[];
const run: RunApi = Searcher.run;

type SafeWordsApi = <E, D>(universe: Universe<E, D>, elements: E[], words: string[], optimise?: (e: E) => boolean) => SearchResult<E>[];
const safeWords: SafeWordsApi = Searcher.safeWords;

type SafeTokenApi = <E, D>(universe: Universe<E, D>, elements: E[], token: string, optimise?: (e: E) => boolean) => SearchResult<E>[];
const safeToken: SafeTokenApi = Searcher.safeToken;

export {
  safeWords,
  safeToken,
  run
};