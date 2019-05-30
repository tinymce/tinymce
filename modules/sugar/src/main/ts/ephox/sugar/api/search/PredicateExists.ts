import * as PredicateFind from './PredicateFind';
import Element from '../node/Element';

const any = function (predicate: (e: Element) => boolean) {
  return PredicateFind.first(predicate).isSome();
};

const ancestor = function (scope: Element, predicate: (e: Element) => boolean, isRoot?) {
  return PredicateFind.ancestor(scope, predicate, isRoot).isSome();
};

const closest = function (scope: Element, predicate: (e: Element) => boolean, isRoot?) {
  return PredicateFind.closest(scope, predicate, isRoot).isSome();
};

const sibling = function (scope: Element, predicate: (e: Element) => boolean) {
  return PredicateFind.sibling(scope, predicate).isSome();
};

const child = function (scope: Element, predicate: (e: Element) => boolean) {
  return PredicateFind.child(scope, predicate).isSome();
};

const descendant = function (scope: Element, predicate: (e: Element) => boolean) {
  return PredicateFind.descendant(scope, predicate).isSome();
};

export {
  any,
  ancestor,
  closest,
  sibling,
  child,
  descendant,
};