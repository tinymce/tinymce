import { Universe } from '@ephox/boss';
import { Arr, Fun } from '@ephox/katamari';
import { LanguageZones } from '../zone/LanguageZones';
import ClusterSearch from './ClusterSearch';
import { WordDecision } from './WordDecision';

// This identifies the inline edges to the left and right, ignoring any language
// boundaries
const byBoundary = function <E, D> (universe: Universe<E, D>, item: E) {
  const isCustomBoundary = Fun.constant(false);

  const edges = getEdges(universe, item, item, isCustomBoundary);

  const isMiddleEmpty = function () {
    return ClusterSearch.isEmpty(universe, item);
  };

  const isEmpty = edges.isEmpty() && isMiddleEmpty();

  return {
    left: edges.left,
    right: edges.right,
    isEmpty: Fun.constant(isEmpty)
  };
};

// This identifies the edges to the left and right, using a custom boundaryFunction
// to use in addition to normal boundaries. Often, it's language
const getEdges = function <E, D> (universe: Universe<E, D>, start: E, finish: E, isCustomBoundary: (universe: Universe<E, D>, item: E) => boolean) {
  const toLeft = ClusterSearch.creepLeft(universe, start, isCustomBoundary);
  const toRight = ClusterSearch.creepRight(universe, finish, isCustomBoundary);

  const leftEdge = toLeft.length > 0 ? toLeft[toLeft.length - 1] : WordDecision.fromItem(universe, start);
  const rightEdge = toRight.length > 0 ? toRight[toRight.length - 1] : WordDecision.fromItem(universe, finish);

  const isEmpty = toLeft.length === 0 && toRight.length === 0;

  return {
    left: Fun.constant(leftEdge),
    right: Fun.constant(rightEdge),
    isEmpty: Fun.constant(isEmpty)
  };
};

// Return a grouping of: left, middle, right, lang, and all. It will use
// language boundaries in addition to the normal block boundaries. Use this
// to create a cluster of the same language.
const byLanguage = function <E, D> (universe: Universe<E, D>, item: E) {
  const optLang = LanguageZones.calculate(universe, item);
  const isLanguageBoundary = LanguageZones.softBounder(optLang);

  const toLeft = ClusterSearch.creepLeft(universe, item, isLanguageBoundary);
  const toRight = ClusterSearch.creepRight(universe, item, isLanguageBoundary);
  const middle =  universe.property().isText(item) ? [ WordDecision.detail(universe, item) ] : [ ];

  const all = Arr.reverse(toLeft).concat(middle).concat(toRight);

  return {
    all: Fun.constant(all),
    left: Fun.constant(toLeft),
    middle: Fun.constant(middle),
    right: Fun.constant(toRight),
    lang: Fun.constant(optLang)
  };
};

export default {
  byBoundary,
  getEdges,
  byLanguage
};