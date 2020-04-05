import { Element as DomElement, Node as DomNode } from '@ephox/dom-globals';
import Element from '../node/Element';
import * as PredicateFilter from './PredicateFilter';
import * as Selectors from './Selectors';

const all = <T extends DomElement = DomElement> (selector: string) => Selectors.all<T>(selector);

// For all of the following:
//
// jQuery does siblings of firstChild. IE9+ supports scope.dom().children (similar to Traverse.children but elements only).
// Traverse should also do this (but probably not by default).
//

const ancestors = <T extends DomElement = DomElement> (scope: Element<DomNode>, selector: string, isRoot?: (e: Element<DomNode>) => boolean) => {
  // It may surprise you to learn this is exactly what JQuery does
  // TODO: Avoid all this wrapping and unwrapping
  return PredicateFilter.ancestors(scope, (e): e is Element<T> => {
    return Selectors.is<T>(e, selector);
  }, isRoot);
};

const siblings = <T extends DomElement = DomElement> (scope: Element<DomNode>, selector: string) => {
  // It may surprise you to learn this is exactly what JQuery does
  // TODO: Avoid all the wrapping and unwrapping
  return PredicateFilter.siblings(scope, (e): e is Element<T> => {
    return Selectors.is<T>(e, selector);
  });
};

const children = <T extends DomElement = DomElement> (scope: Element<DomNode>, selector: string) => {
  // It may surprise you to learn this is exactly what JQuery does
  // TODO: Avoid all the wrapping and unwrapping
  return PredicateFilter.children(scope, (e): e is Element<T> => {
    return Selectors.is<T>(e, selector);
  });
};

const descendants = <T extends DomElement = DomElement> (scope: Element<DomNode>, selector: string) => {
  return Selectors.all<T>(selector, scope);
};

export {
  all,
  ancestors,
  siblings,
  children,
  descendants,
};
