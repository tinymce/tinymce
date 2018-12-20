import { Arr, Fun } from '@ephox/katamari';
import * as Compare from '../dom/Compare';
import Element from '../node/Element';
import * as PredicateExists from './PredicateExists';

const ancestor = function (element: Element, target: Element) {
  return PredicateExists.ancestor(element, Fun.curry(Compare.eq, target));
};

const anyAncestor = function (element: Element, targets: Element[]) {
  return Arr.exists(targets, function (target) {
    return ancestor(element, target);
  });
};

const sibling = function (element: Element, targets: Element[]) {
  return PredicateExists.sibling(element, (elem) => Arr.exists(targets, Fun.curry(Compare.eq, elem)));
};

const child = function (element: Element, target: Element) {
  return PredicateExists.child(element, Fun.curry(Compare.eq, target));
};

const descendant = function (element: Element, target: Element) {
  return PredicateExists.descendant(element, Fun.curry(Compare.eq, target));
};

export { ancestor, anyAncestor, sibling, child, descendant, };
