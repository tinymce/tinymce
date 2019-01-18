import Splitter from '../../search/Splitter';
import Positions from '../../split/Positions';
import Range from '../../split/Range';
import Split from '../../split/Split';

var split = function (universe, item, position) {
  return Split.split(universe, item, position);
};

var splitByPair = function (universe, item, start, finish) {
  return Split.splitByPair(universe, item, start, finish);
};

var range = function (universe, start, startOffset, finish, finishOffset) {
  return Range.nodes(universe, start, startOffset, finish, finishOffset);
};

var subdivide = function (universe, item, positions) {
  return Splitter.subdivide(universe, item, positions);
};

var position = function (universe, target) {
  return Positions.determine(target);
};

export default {
  split: split,
  splitByPair: splitByPair,
  range: range,
  subdivide: subdivide,
  position: position
};