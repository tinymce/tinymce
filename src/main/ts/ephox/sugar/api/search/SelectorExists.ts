import SelectorFind from './SelectorFind';
import Element from '../node/Element';

var any = function (selector: string) {
  return SelectorFind.first(selector).isSome();
};

var ancestor = function (scope: Element, selector: string, isRoot?) {
  return SelectorFind.ancestor(scope, selector, isRoot).isSome();
};

var sibling = function (scope: Element, selector: string) {
  return SelectorFind.sibling(scope, selector).isSome();
};

var child = function (scope: Element, selector: string) {
  return SelectorFind.child(scope, selector).isSome();
};

var descendant = function (scope: Element, selector: string) {
  return SelectorFind.descendant(scope, selector).isSome();
};

var closest = function (scope: Element, selector: string, isRoot?) {
  return SelectorFind.closest(scope, selector, isRoot).isSome();
};

export default {
  any,
  ancestor,
  sibling,
  child,
  descendant,
  closest,
};