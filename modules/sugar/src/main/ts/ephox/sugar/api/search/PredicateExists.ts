import { Node as DomNode } from '@ephox/dom-globals';
import Element from '../node/Element';
import * as PredicateFind from './PredicateFind';

const any = (predicate: (e: Element<DomNode>) => boolean) =>
  PredicateFind.first(predicate).isSome();

const ancestor = (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean, isRoot?: (e: Element<DomNode>) => boolean) =>
  PredicateFind.ancestor(scope, predicate, isRoot).isSome();

const closest = (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean, isRoot?: (e: Element<DomNode>) => boolean) =>
  PredicateFind.closest(scope, predicate, isRoot).isSome();

const sibling = (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean) =>
  PredicateFind.sibling(scope, predicate).isSome();

const child = (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean) =>
  PredicateFind.child(scope, predicate).isSome();

const descendant = (scope: Element<DomNode>, predicate: (e: Element<DomNode>) => boolean) =>
  PredicateFind.descendant(scope, predicate).isSome();

export {
  any,
  ancestor,
  closest,
  sibling,
  child,
  descendant
};
