import { Node as DomNode } from '@ephox/dom-globals';
import Element from '../node/Element';
import * as SelectorFind from './SelectorFind';

const any = (selector: string) =>
  SelectorFind.first(selector).isSome();

const ancestor = (scope: Element<DomNode>, selector: string, isRoot?: (e: Element<DomNode>) => boolean) =>
  SelectorFind.ancestor(scope, selector, isRoot).isSome();

const sibling = (scope: Element<DomNode>, selector: string) =>
  SelectorFind.sibling(scope, selector).isSome();

const child = (scope: Element<DomNode>, selector: string) =>
  SelectorFind.child(scope, selector).isSome();

const descendant = (scope: Element<DomNode>, selector: string) =>
  SelectorFind.descendant(scope, selector).isSome();

const closest = (scope: Element<DomNode>, selector: string, isRoot?: (e: Element<DomNode>) => boolean) =>
  SelectorFind.closest(scope, selector, isRoot).isSome();

export {
  any,
  ancestor,
  sibling,
  child,
  descendant,
  closest
};
