import Group from '../../family/Group';
import Range from '../../family/Range';

var range = function (universe, start, startDelta, finish, finishDelta) {
  return Range.range(universe, start, startDelta, finish, finishDelta);
};

var group = function (universe, items, optimise) {
  return Group.group(universe, items, optimise);
};

export default {
  range: range,
  group: group
};