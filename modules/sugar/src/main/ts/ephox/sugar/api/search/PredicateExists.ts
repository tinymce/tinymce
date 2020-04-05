import { Node as DomNode } from '@ephox/dom-globals';
import Element from '../node/Element';
import * as PredicateFind from './PredicateFind';

const any = (predicate: (e: Element<DomNode>) => boolean) => {
  return PredicateFind.first(predicate).isSome();
};

const ancestor = (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean, isRoot?: (e: Element<DomNode>) => boolean) => {
  return PredicateFind.ancestor(scope, predicate, isRoot).isSome();
};

const closest = (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean, isRoot?: (e: Element<DomNode>) => boolean) => {
  return PredicateFind.closest(scope, predicate, isRoot).isSome();
};

const sibling = (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean) => {
  return PredicateFind.sibling(scope, predicate).isSome();
};

const child = (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean) => {
  return PredicateFind.child(scope, predicate).isSome();
};

const descendant = (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean) => {
  return PredicateFind.descendant(scope, predicate).isSome();
};

export {
  any,
  ancestor,
  closest,
  sibling,
  child,
  descendant
};
