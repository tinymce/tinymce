import { DomUniverse } from '@ephox/boss';
import Parent from '../general/Parent';

var universe = DomUniverse();

var sharedOne = function (look, elements) {
  return Parent.sharedOne(universe, function (universe, element) {
    return look(element);
  }, elements);
};

var subset = function (start, finish) {
  return Parent.subset(universe, start, finish);
};

var ancestors = function (start, finish, _isRoot) {
  return Parent.ancestors(universe, start, finish, _isRoot);
};

var breakToLeft = function (parent, child) {
  return Parent.breakToLeft(universe, parent, child);
};

var breakToRight = function (parent, child) {
  return Parent.breakToRight(universe, parent, child);
};

var breakPath = function (child, isTop, breaker) {
  return Parent.breakPath(universe, child, isTop, function (u, p, c) {
    return breaker(p, c);
  });
};

export default <any> {
  sharedOne: sharedOne,
  subset: subset,
  ancestors: ancestors,
  breakToLeft: breakToLeft,
  breakToRight: breakToRight,
  breakPath: breakPath
};