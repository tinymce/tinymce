import { SugarElement } from '../node/SugarElement';
import * as PredicateFilter from './PredicateFilter';
import * as Selectors from './Selectors';

const all = <T extends Element = Element> (selector: string): SugarElement<T>[] =>
  Selectors.all<T>(selector);

// For all of the following:
//
// jQuery does siblings of firstChild. IE9+ supports scope.dom.children (similar to Traverse.children but elements only).
// Traverse should also do this (but probably not by default).
//

const ancestors = <T extends Element = Element> (scope: SugarElement<Node>, selector: string, isRoot?: (e: SugarElement<Node>) => boolean): SugarElement<T>[] =>
  // It may surprise you to learn this is exactly what JQuery does
  // TODO: Avoid all this wrapping and unwrapping
  PredicateFilter.ancestors(scope, (e): e is SugarElement<T> => Selectors.is<T>(e, selector), isRoot);

const siblings = <T extends Element = Element> (scope: SugarElement<Node>, selector: string): SugarElement<T>[] =>
  // It may surprise you to learn this is exactly what JQuery does
  // TODO: Avoid all the wrapping and unwrapping
  PredicateFilter.siblings(scope, (e): e is SugarElement<T> => Selectors.is<T>(e, selector));

const children = <T extends Element = Element> (scope: SugarElement<Node>, selector: string): SugarElement<T>[] =>
  // It may surprise you to learn this is exactly what JQuery does
  // TODO: Avoid all the wrapping and unwrapping
  PredicateFilter.children(scope, (e): e is SugarElement<T> => Selectors.is<T>(e, selector));

const descendants = <T extends Element = Element> (scope: SugarElement<Node>, selector: string): SugarElement<T>[] =>
  Selectors.all<T>(selector, scope);

export {
  all,
  ancestors,
  siblings,
  children,
  descendants
};
