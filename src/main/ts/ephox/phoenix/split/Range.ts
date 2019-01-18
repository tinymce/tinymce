import Spot from '../api/data/Spot';
import Family from '../api/general/Family';
import Split from './Split';

/**
 * Splits the start and end, then collects all text nodes in between.
 */
var diff = function (universe, base, baseOffset, end, endOffset) {
  var start = Split.split(universe, base, baseOffset).after().fold(function () {
    return Spot.delta(base, 1);
  }, function (after) {
    return Spot.delta(after, 0);
  });

  var finish = Split.split(universe, end, endOffset).before().fold(function () {
    return Spot.delta(end, 0);
  }, function (before) {
    return Spot.delta(before, 1);
  });
  return Family.range(universe, start.element(), start.deltaOffset(), finish.element(), finish.deltaOffset());
};

/**
 * Splits a text node using the offsets specified.
 */
var same = function (universe, base, baseOffset, end, endOffset) {
  var middle = Split.splitByPair(universe, base, baseOffset, endOffset);
  return [middle];
};

/**
 * Returns all text nodes in range. Uses same() or diff() depending on whether base === end.
 */
var nodes = function (universe, base, baseOffset, end, endOffset) {
  var f = universe.eq(base, end) ? same : diff;
  return f(universe, base, baseOffset, end, endOffset);
};

export default {
  nodes: nodes
};