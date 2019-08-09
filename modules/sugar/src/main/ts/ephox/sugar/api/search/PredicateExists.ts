import * as PredicateFind from './PredicateFind';
import Element from '../node/Element';
import { Node as DomNode } from '@ephox/dom-globals';

const any = function (predicate: (e: Element<DomNode>) => boolean) {
  return PredicateFind.first(predicate).isSome();
};

const ancestor = function (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean, isRoot?: (e: Element<DomNode>) => boolean) {
  return PredicateFind.ancestor(scope, predicate, isRoot).isSome();
};

const closest = function (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean, isRoot?: (e: Element<DomNode>) => boolean) {
  return PredicateFind.closest(scope, predicate, isRoot).isSome();
};

const sibling = function (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean) {
  return PredicateFind.sibling(scope, predicate).isSome();
};

const child = function (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean) {
  return PredicateFind.child(scope, predicate).isSome();
};

const descendant = function (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean) {
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