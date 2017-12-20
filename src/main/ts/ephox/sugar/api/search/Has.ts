import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import Compare from '../dom/Compare';
import PredicateExists from './PredicateExists';

var ancestor = function (element, target) {
  return PredicateExists.ancestor(element, Fun.curry(Compare.eq, target));
};

var anyAncestor = function (element, targets) {
  return Arr.exists(targets, function (target) {
    return ancestor(element, target);
  });
};

var sibling = function (element, target) {
  return PredicateExists.sibling(element, Fun.curry(Compare.eq, target));
};

var child = function (element, target) {
  return PredicateExists.child(element, Fun.curry(Compare.eq, target));
};

var descendant = function (element, target) {
  return PredicateExists.descendant(element, Fun.curry(Compare.eq, target));
};

export default <any> {
  ancestor: ancestor,
  anyAncestor: anyAncestor,
  sibling: sibling,
  child: child,
  descendant: descendant
};