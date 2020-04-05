import { Node as DomNode } from '@ephox/dom-globals';
import Element from '../node/Element';
import * as SelectorFind from './SelectorFind';

const any = (selector: string) => {
  return SelectorFind.first(selector).isSome();
};

const ancestor = (scope: Element<DomNode>, selector: string, isRoot?: (e: Element<DomNode>) => boolean) => {
  return SelectorFind.ancestor(scope, selector, isRoot).isSome();
};

const sibling = (scope: Element<DomNode>, selector: string) => {
  return SelectorFind.sibling(scope, selector).isSome();
};

const child = (scope: Element<DomNode>, selector: string) => {
  return SelectorFind.child(scope, selector).isSome();
};

const descendant = (scope: Element<DomNode>, selector: string) => {
  return SelectorFind.descendant(scope, selector).isSome();
};

const closest = (scope: Element<DomNode>, selector: string, isRoot?: (e: Element<DomNode>) => boolean) => {
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
