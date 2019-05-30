import Breaker from '../../parent/Breaker';
import Shared from '../../parent/Shared';
import Subset from '../../parent/Subset';

var sharedOne = function (universe, look, elements) {
  return Shared.oneAll(universe, look, elements);
};

var subset = function (universe, start, finish) {
  return Subset.subset(universe, start, finish);
};

var ancestors = function (universe, start, finish, _isRoot) {
  return Subset.ancestors(universe, start, finish, _isRoot);
};

var breakToLeft = function (universe, parent, child) {
  return Breaker.breakToLeft(universe, parent, child);
};

var breakToRight = function (universe, parent, child) {
  return Breaker.breakToRight(universe, parent, child);
};

var breakPath = function (universe, child, isTop, breaker) {
  return Breaker.breakPath(universe, child, isTop, breaker);
};

export default <any> {
  sharedOne: sharedOne,
  subset: subset,
  ancestors: ancestors,
  breakToLeft: breakToLeft,
  breakToRight: breakToRight,
  breakPath: breakPath
};