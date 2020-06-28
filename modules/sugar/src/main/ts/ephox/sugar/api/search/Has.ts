import { Node as DomNode } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import * as Compare from '../dom/Compare';
import Element from '../node/Element';
import * as PredicateExists from './PredicateExists';

const ancestor = (element: Element<DomNode>, target: Element<DomNode>): boolean =>
  PredicateExists.ancestor(element, Fun.curry(Compare.eq, target));

const anyAncestor = (element: Element<DomNode>, targets: Element<DomNode>[]): boolean =>
  Arr.exists(targets, (target) => ancestor(element, target));

const sibling = (element: Element<DomNode>, targets: Element<DomNode>[]): boolean =>
  PredicateExists.sibling(element, (elem) => Arr.exists(targets, Fun.curry(Compare.eq, elem)));

const child = (element: Element<DomNode>, target: Element<DomNode>): boolean =>
  PredicateExists.child(element, Fun.curry(Compare.eq, target));

const descendant = (element: Element<DomNode>, target: Element<DomNode>): boolean =>
  PredicateExists.descendant(element, Fun.curry(Compare.eq, target));

export { ancestor, anyAncestor, sibling, child, descendant };
