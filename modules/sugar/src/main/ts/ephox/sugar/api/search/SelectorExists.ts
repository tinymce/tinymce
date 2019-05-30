import * as SelectorFind from './SelectorFind';
import Element from '../node/Element';

const any = function (selector: string) {
  return SelectorFind.first(selector).isSome();
};

const ancestor = function (scope: Element, selector: string, isRoot?) {
  return SelectorFind.ancestor(scope, selector, isRoot).isSome();
};

const sibling = function (scope: Element, selector: string) {
  return SelectorFind.sibling(scope, selector).isSome();
};

const child = function (scope: Element, selector: string) {
  return SelectorFind.child(scope, selector).isSome();
};

const descendant = function (scope: Element, selector: string) {
  return SelectorFind.descendant(scope, selector).isSome();
};

const closest = function (scope: Element, selector: string, isRoot?) {
  return SelectorFind.closest(scope, selector, isRoot).isSome();
};

export {
  any,
  ancestor,
  sibling,
  child,
  descendant,
  closest,
};