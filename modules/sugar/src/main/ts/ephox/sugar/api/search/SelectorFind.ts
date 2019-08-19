import * as PredicateFind from './PredicateFind';
import * as Selectors from './Selectors';
import ClosestOrAncestor from '../../impl/ClosestOrAncestor';
import Element from '../node/Element';
import { Node as DomNode, Element as DomElement, Document } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';

// TODO: An internal SelectorFilter module that doesn't Element.fromDom() everything

const first = function <T extends DomElement = DomElement> (selector: string) {
  return Selectors.one<T>(selector);
};

const ancestor = function <T extends DomElement = DomElement> (scope: Element<DomNode>, selector: string, isRoot?: (e: Element<DomNode>) => boolean) {
  return PredicateFind.ancestor(scope, function (e): e is Element<T> {
    return Selectors.is<T>(e, selector);
  }, isRoot);
};

const sibling = function <T extends DomElement = DomElement> (scope: Element<DomNode>, selector: string) {
  return PredicateFind.sibling(scope, function (e): e is Element<T> {
    return Selectors.is<T>(e, selector);
  });
};

const child = function <T extends DomElement = DomElement> (scope: Element<DomNode>, selector: string) {
  return PredicateFind.child(scope, function (e): e is Element<T> {
    return Selectors.is<T>(e, selector);
  });
};

const descendant = function <T extends DomElement = DomElement> (scope: Element<DomNode>, selector: string) {
  return Selectors.one<T>(selector, scope);
};

// Returns Some(closest ancestor element (sugared)) matching 'selector' up to isRoot, or None() otherwise
const closest = function <T extends DomElement = DomElement> (scope: Element<DomNode>, selector: string, isRoot?: (e: Element<DomNode>) => boolean) {
  return ClosestOrAncestor<string>(Selectors.is, ancestor, scope, selector, isRoot) as Option<Element<T>>;
};

export {
  first,
  ancestor,
  sibling,
  child,
  descendant,
  closest,
};