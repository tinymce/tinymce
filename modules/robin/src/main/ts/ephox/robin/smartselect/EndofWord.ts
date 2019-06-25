import { Universe } from '@ephox/boss';
import { Arr, Fun, Option, Unicode } from '@ephox/katamari';
import { WordRange } from '../data/WordRange';
import Clustering from '../words/Clustering';
import { WordDecisionItem } from '../words/WordDecision';

const toEnd = function <E> (cluster: WordDecisionItem<E>[], start: E, soffset: number) {
  if (cluster.length === 0) {
    return Option.none<WordRange<E>>();
  }
  const last = cluster[cluster.length - 1];
  return Option.some(WordRange(start, soffset, last.item(), last.finish()));
};

const fromStart = function <E> (cluster: WordDecisionItem<E>[], finish: E, foffset: number) {
  if (cluster.length === 0) {
    return Option.none<WordRange<E>>();
  }
  const first = cluster[0];
  return Option.some(WordRange(first.item(), first.start(), finish, foffset));
};

const all = function <E> (cluster: WordDecisionItem<E>[]) {
  if (cluster.length === 0) {
    return Option.none<WordRange<E>>();
  }
  const first = cluster[0];
  const last = cluster[cluster.length - 1];
  return Option.some(WordRange(first.item(), first.start(), last.item(), last.finish()));
};

const scan = function <E, D> (universe: Universe<E, D>, item: E, offset: number) {
  const text = universe.property().getText(item);
  const preLength = Arr.filter(text.substring(0, offset), function (s) {
    return s !== Unicode.zeroWidth();
  }).length;
  const postLength = Arr.filter(text.substring(offset, text.length), function (c) {
    return c === Unicode.zeroWidth();
  }).length;

  // We only want to identify words that are all the same language.
  const cluster = Clustering.byLanguage(universe, item);
  // We are at the left edge of the cluster.
  const atLeftEdge = preLength === 0 && cluster.left().length === 0;
  // We are at the right edge of the cluster.
  const atRightEdge = (offset + postLength) === text.length && cluster.right().length === 0;

  return {
    all: cluster.all,
    leftEdge: Fun.constant(atLeftEdge),
    rightEdge: Fun.constant(atRightEdge),
    text: Fun.constant(text)
  };
};

// There was only a break in the node before the current position, so
// as long as we are not already at the right edge of the node AND cluster, we extend to the
// end of the cluster.
const before = function <E, D> (universe: Universe<E, D>, item: E, offset: number, bindex: number) {
  const info = scan(universe, item, offset);
  return info.rightEdge() ? Option.none<WordRange<E>>() : toEnd(info.all(), item, bindex);
};

// There was only a break in the node after the current position, so
// as long as we are not already at the left edge of the node AND cluster, we extend from the
// start of the cluster to the index.
const after = function <E, D> (universe: Universe<E, D>, item: E, offset: number, aindex: number) {
  const info = scan(universe, item, offset);
  return info.leftEdge() ? Option.none<WordRange<E>>() : fromStart(info.all(), item, aindex);
};

// We don't need to use the cluster, because we are in the middle of two breaks. Only return something
// if the breaks aren't at the same position.
const both = function <E, D> (universe: Universe<E, D>, item: E, offset: number, bindex: number, aindex: number) {
  return bindex === aindex ? Option.none<WordRange<E>>() : Option.some(WordRange(item, bindex, item, aindex));
};

// There are no breaks in the current node, so as long as we aren't at either edge of node/cluster,
// then we extend the length of the cluster.
const neither = function <E, D> (universe: Universe<E, D>, item: E, offset: number) {
  const info = scan(universe, item, offset);
  return info.leftEdge() || info.rightEdge() ? Option.none<WordRange<E>>() : all(info.all());
};

export default {
  before,
  after,
  both,
  neither
};