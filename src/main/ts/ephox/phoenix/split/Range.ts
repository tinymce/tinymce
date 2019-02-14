import { Universe } from '@ephox/boss';
import * as Spot from '../api/data/Spot';
import * as Family from '../api/general/Family';
import * as Split from './Split';

/**
 * Splits the start and end, then collects all text nodes in between.
 */
const diff = function <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, end: E, endOffset: number) {
  const start = Split.split(universe, base, baseOffset).after().fold(function () {
    return Spot.delta(base, 1);
  }, function (after) {
    return Spot.delta(after, 0);
  });

  const finish = Split.split(universe, end, endOffset).before().fold(function () {
    return Spot.delta(end, 0);
  }, function (before) {
    return Spot.delta(before, 1);
  });
  return Family.range(universe, start.element(), start.deltaOffset(), finish.element(), finish.deltaOffset());
};

/**
 * Splits a text node using the offsets specified.
 */
const same = function <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, _end: E, endOffset: number) {
  const middle = Split.splitByPair(universe, base, baseOffset, endOffset);
  return [middle];
};

/**
 * Returns all text nodes in range. Uses same() or diff() depending on whether base === end.
 */
const nodes = function <E, D>(universe: Universe<E, D>, base: E, baseOffset: number, end: E, endOffset: number) {
  const f = universe.eq(base, end) ? same : diff;
  return f(universe, base, baseOffset, end, endOffset);
};

export {
  nodes
};