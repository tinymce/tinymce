import { DomUniverse } from '@ephox/boss';
import Split from '../general/Split';

var universe = DomUniverse();

var split = function (element, position) {
  return Split.split(universe, element, position);
};

var splitByPair = function (element, start, finish) {
  return Split.splitByPair(universe, element, start, finish);
};

var range = function (start, startOffset, finish, finishOffset) {
  return Split.range(universe, start, startOffset, finish, finishOffset);
};

var subdivide = function (element, positions) {
  return Split.subdivide(universe, element, positions);
};

var position = function (target) {
  return Split.position(universe, target);
};

export default {
  split: split,
  splitByPair: splitByPair,
  range: range,
  subdivide: subdivide,
  position: position
};