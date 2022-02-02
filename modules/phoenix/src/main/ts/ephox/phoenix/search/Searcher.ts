import { Universe } from '@ephox/boss';
import { Arr, Optional } from '@ephox/katamari';
import { Pattern, PositionArray, Search } from '@ephox/polaris';

import { NamedPattern } from '../api/data/NamedPattern';
import * as Spot from '../api/data/Spot';
import { TypedItem } from '../api/data/TypedItem';
import { SearchResult, SpotRange } from '../api/data/Types';
import * as Family from '../api/general/Family';
import * as TypedList from '../extract/TypedList';
import * as MatchSplitter from './MatchSplitter';

const gen = <E, D>(universe: Universe<E, D>, input: E[]): SpotRange<E>[] => {
  return PositionArray.generate(input, (unit, offset) => {
    const finish = offset + universe.property().getText(unit).length;
    return Optional.from(Spot.range(unit, offset, finish));
  });
};

/**
 * Extracts groups of elements separated by boundaries.
 *
 * For each group, search the text for pattern matches.
 *
 * Returns a list of matches.
 */
const run = <E, D>(universe: Universe<E, D>, elements: E[], patterns: NamedPattern[], optimise?: (e: E) => boolean): SearchResult<E>[] => {
  const sections = Family.group(universe, elements, optimise);
  const result = Arr.bind(sections, (x: TypedItem<E, D>[]) => {
    const input = TypedList.justText(x);
    const text = Arr.map(input, universe.property().getText).join('');

    const matches = Search.findmany(text, patterns);
    const plist = gen(universe, input);

    return MatchSplitter.separate(universe, plist, matches);
  });

  return result;
};

/**
 * Runs a search for one or more words
 */
const safeWords = <E, D>(universe: Universe<E, D>, elements: E[], words: string[], optimise?: (e: E) => boolean): SearchResult<E>[] => {
  const patterns = Arr.map(words, (word) => {
    const pattern = Pattern.safeword(word);
    return NamedPattern(word, pattern);
  });
  return run(universe, elements, patterns, optimise);
};

/**
 * Runs a search for a single token
 */
const safeToken = <E, D>(universe: Universe<E, D>, elements: E[], token: string, optimise?: (e: E) => boolean): SearchResult<E>[] => {
  const pattern = NamedPattern(token, Pattern.safetoken(token));
  return run(universe, elements, [ pattern ], optimise);
};

export {
  safeWords,
  safeToken,
  run
};
