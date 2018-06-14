import PredicateFind from './PredicateFind';
import Element from '../node/Element';

var any = function (predicate: (e: Element) => boolean) {
  return PredicateFind.first(predicate).isSome();
};

var ancestor = function (scope: Element, predicate: (e: Element) => boolean, isRoot?) {
  return PredicateFind.ancestor(scope, predicate, isRoot).isSome();
};

var closest = function (scope: Element, predicate: (e: Element) => boolean, isRoot?) {
  return PredicateFind.closest(scope, predicate, isRoot).isSome();
};

var sibling = function (scope: Element, predicate: (e: Element) => boolean) {
  return PredicateFind.sibling(scope, predicate).isSome();
};

var child = function (scope: Element, predicate: (e: Element) => boolean) {
  return PredicateFind.child(scope, predicate).isSome();
};

var descendant = function (scope: Element, predicate: (e: Element) => boolean) {
  return PredicateFind.descendant(scope, predicate).isSome();
};

export default {
  any,
  ancestor,
  closest,
  sibling,
  child,
  descendant,
};