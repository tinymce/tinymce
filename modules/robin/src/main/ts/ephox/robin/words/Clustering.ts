import { Universe } from '@ephox/boss';
import { Arr, Fun, Optional } from '@ephox/katamari';

import { LanguageZones } from '../zone/LanguageZones';
import * as ClusterSearch from './ClusterSearch';
import { WordDecision, WordDecisionItem } from './WordDecision';

interface Edges<E> {
  readonly left: WordDecisionItem<E>;
  readonly isEmpty: boolean;
  readonly right: WordDecisionItem<E>;
}

// This identifies the inline edges to the left and right, ignoring any language
// boundaries
const byBoundary = <E, D>(universe: Universe<E, D>, item: E): Edges<E> => {
  const isCustomBoundary = Fun.never;

  const edges = getEdges(universe, item, item, isCustomBoundary);

  const isMiddleEmpty = () => {
    return ClusterSearch.isEmpty(universe, item);
  };

  const isEmpty = edges.isEmpty && isMiddleEmpty();

  return {
    left: edges.left,
    right: edges.right,
    isEmpty
  };
};

// This identifies the edges to the left and right, using a custom boundaryFunction
// to use in addition to normal boundaries. Often, it's language
const getEdges = <E, D>(universe: Universe<E, D>, start: E, finish: E, isCustomBoundary: (universe: Universe<E, D>, item: E) => boolean): Edges<E> => {
  const toLeft = ClusterSearch.creepLeft(universe, start, isCustomBoundary);
  const toRight = ClusterSearch.creepRight(universe, finish, isCustomBoundary);

  const leftEdge = toLeft.length > 0 ? toLeft[toLeft.length - 1] : WordDecision.fromItem(universe, start);
  const rightEdge = toRight.length > 0 ? toRight[toRight.length - 1] : WordDecision.fromItem(universe, finish);

  const isEmpty = toLeft.length === 0 && toRight.length === 0;

  return {
    left: leftEdge,
    right: rightEdge,
    isEmpty
  };
};

interface Grouping<E> {
  readonly all: WordDecisionItem<E>[];
  readonly middle: WordDecisionItem<E>[];
  readonly left: WordDecisionItem<E>[];
  readonly right: WordDecisionItem<E>[];
  readonly lang: Optional<string>;
}

// Return a grouping of: left, middle, right, lang, and all. It will use
// language boundaries in addition to the normal block boundaries. Use this
// to create a cluster of the same language.
const byLanguage = <E, D>(universe: Universe<E, D>, item: E): Grouping<E> => {
  const optLang = LanguageZones.calculate(universe, item);
  const isLanguageBoundary = LanguageZones.softBounder(optLang);

  const toLeft = ClusterSearch.creepLeft(universe, item, isLanguageBoundary);
  const toRight = ClusterSearch.creepRight(universe, item, isLanguageBoundary);
  const middle = universe.property().isText(item) ? [ WordDecision.detail(universe, item) ] : [ ];

  const all = Arr.reverse(toLeft).concat(middle).concat(toRight);

  return {
    all,
    left: toLeft,
    middle,
    right: toRight,
    lang: optLang
  };
};

export {
  byBoundary,
  getEdges,
  byLanguage
};
