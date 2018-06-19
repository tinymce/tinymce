import PredicateFilter from './PredicateFilter';
import Selectors from './Selectors';
import Element from '../node/Element';

var all = function (selector: string) {
  return Selectors.all(selector);
};

// For all of the following:
//
// jQuery does siblings of firstChild. IE9+ supports scope.dom().children (similar to Traverse.children but elements only).
// Traverse should also do this (but probably not by default).
//

var ancestors = function (scope: Element, selector: string, isRoot?) {
  // It may surprise you to learn this is exactly what JQuery does
  // TODO: Avoid all this wrapping and unwrapping
  return PredicateFilter.ancestors(scope, function (e) {
    return Selectors.is(e, selector);
  }, isRoot);
};

var siblings = function (scope: Element, selector: string) {
  // It may surprise you to learn this is exactly what JQuery does
  // TODO: Avoid all the wrapping and unwrapping
  return PredicateFilter.siblings(scope, function (e) {
    return Selectors.is(e, selector);
  });
};

var children = function (scope: Element, selector: string) {
  // It may surprise you to learn this is exactly what JQuery does
  // TODO: Avoid all the wrapping and unwrapping
  return PredicateFilter.children(scope, function (e) {
    return Selectors.is(e, selector);
  });
};

var descendants = function (scope: Element, selector: string) {
  return Selectors.all(selector, scope);
};

export default {
  all,
  ancestors,
  siblings,
  children,
  descendants,
};