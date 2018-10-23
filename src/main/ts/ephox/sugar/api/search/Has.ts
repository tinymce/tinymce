import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import * as Compare from '../dom/Compare';
import * as PredicateExists from './PredicateExists';
import Element from '../node/Element';

var ancestor = function (element: Element, target: Element) {
  return PredicateExists.ancestor(element, Fun.curry(Compare.eq, target));
};

var anyAncestor = function (element: Element, targets: Element[]) {
  return Arr.exists(targets, function (target) {
    return ancestor(element, target);
  });
};

var sibling = function (element: Element, targets: Element[]) {
  return PredicateExists.sibling(element, (elem) => Arr.exists(targets, Fun.curry(Compare.eq, elem)));
};

var child = function (element: Element, target: Element) {
  return PredicateExists.child(element, Fun.curry(Compare.eq, target));
};

var descendant = function (element: Element, target: Element) {
  return PredicateExists.descendant(element, Fun.curry(Compare.eq, target));
};

export {
  ancestor,
  anyAncestor,
  sibling,
  child,
  descendant,
};