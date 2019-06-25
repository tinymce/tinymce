import * as PredicateFilter from './PredicateFilter';
import * as Selectors from './Selectors';
import Element from '../node/Element';

const all = function (selector: string) {
  return Selectors.all(selector);
};

// For all of the following:
//
// jQuery does siblings of firstChild. IE9+ supports scope.dom().children (similar to Traverse.children but elements only).
// Traverse should also do this (but probably not by default).
//

const ancestors = function (scope: Element, selector: string, isRoot?: (e: Element) => boolean) {
  // It may surprise you to learn this is exactly what JQuery does
  // TODO: Avoid all this wrapping and unwrapping
  return PredicateFilter.ancestors(scope, function (e) {
    return Selectors.is(e, selector);
  }, isRoot);
};

const siblings = function (scope: Element, selector: string) {
  // It may surprise you to learn this is exactly what JQuery does
  // TODO: Avoid all the wrapping and unwrapping
  return PredicateFilter.siblings(scope, function (e) {
    return Selectors.is(e, selector);
  });
};

const children = function (scope: Element, selector: string) {
  // It may surprise you to learn this is exactly what JQuery does
  // TODO: Avoid all the wrapping and unwrapping
  return PredicateFilter.children(scope, function (e) {
    return Selectors.is(e, selector);
  });
};

const descendants = function (scope: Element, selector: string) {
  return Selectors.all(selector, scope);
};

export {
  all,
  ancestors,
  siblings,
  children,
  descendants,
};