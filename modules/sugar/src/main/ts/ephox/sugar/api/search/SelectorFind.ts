import { Element as DomElement, Node as DomNode } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import ClosestOrAncestor from '../../impl/ClosestOrAncestor';
import Element from '../node/Element';
import * as PredicateFind from './PredicateFind';
import * as Selectors from './Selectors';

// TODO: An internal SelectorFilter module that doesn't Element.fromDom() everything

const first = <T extends DomElement = DomElement> (selector: string) =>
  Selectors.one<T>(selector);

const ancestor = <T extends DomElement = DomElement> (scope: Element<DomNode>, selector: string, isRoot?: (e: Element<DomNode>) => boolean) =>
  PredicateFind.ancestor(scope, (e): e is Element<T> => Selectors.is<T>(e, selector), isRoot);

const sibling = <T extends DomElement = DomElement> (scope: Element<DomNode>, selector: string) =>
  PredicateFind.sibling(scope, (e): e is Element<T> => Selectors.is<T>(e, selector));

const child = <T extends DomElement = DomElement> (scope: Element<DomNode>, selector: string) =>
  PredicateFind.child(scope, (e): e is Element<T> => Selectors.is<T>(e, selector));

const descendant = <T extends DomElement = DomElement> (scope: Element<DomNode>, selector: string) =>
  Selectors.one<T>(selector, scope);

// Returns Some(closest ancestor element (sugared)) matching 'selector' up to isRoot, or None() otherwise
const closest = <T extends DomElement = DomElement> (scope: Element<DomNode>, selector: string, isRoot?: (e: Element<DomNode>) => boolean): Option<Element<T>> => {
  const is = (element: Element<DomNode>, selector: string): element is Element<T> => Selectors.is<T>(element, selector);
  return ClosestOrAncestor<string, T>(is, ancestor, scope, selector, isRoot);
};

export {
  first,
  ancestor,
  sibling,
  child,
  descendant,
  closest
};
