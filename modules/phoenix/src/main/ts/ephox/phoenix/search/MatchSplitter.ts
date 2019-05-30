import { Universe } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import { PositionArray, PRange } from '@ephox/polaris';
import { SearchResult, SpotRange } from '../api/data/Types';
import * as Splitter from './Splitter';

/**
 * Split each text node in the list using the match endpoints.
 *
 * Each match is then mapped to the word it matched and the elements that make up the word.
 */
const separate = function <E, D, M extends PRange & {word: () => string}>(universe: Universe<E, D>, list: SpotRange<E>[], matches: M[]) {
  const allPositions = Arr.bind(matches, function (match) {
    return [match.start(), match.finish()];
  });

  const subdivide = function (unit: SpotRange<E>, positions: number[]) {
    return Splitter.subdivide(universe, unit.element(), positions);
  };

  const structure = PositionArray.splits(list, allPositions, subdivide);

  const collate = function (match: M): SearchResult<E> {
    const sub = PositionArray.sublist(structure, match.start(), match.finish());

    const elements = Arr.map(sub, function (unit) { return unit.element(); });

    const exact = Arr.map(elements, universe.property().getText).join('');
    return {
      elements: () => elements,
      word: match.word,
      exact: () => exact
    };
  };

  return Arr.map(matches, collate);
};

export {
  separate
};