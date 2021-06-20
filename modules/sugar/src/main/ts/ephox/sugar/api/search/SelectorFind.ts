import { Optional } from '@ephox/katamari';

import ClosestOrAncestor from '../../impl/ClosestOrAncestor';
import { SugarElement } from '../node/SugarElement';
import * as PredicateFind from './PredicateFind';
import * as Selectors from './Selectors';

// TODO: An internal SelectorFilter module that doesn't SugarElement.fromDom() everything

const first = <T extends Element = Element> (selector: string): Optional<SugarElement<T>> =>
  Selectors.one<T>(selector);

const ancestor = <T extends Element = Element> (scope: SugarElement<Node>, selector: string, isRoot?: (e: SugarElement<Node>) => boolean): Optional<SugarElement<T>> =>
  PredicateFind.ancestor(scope, (e): e is SugarElement<T> => Selectors.is<T>(e, selector), isRoot);

const sibling = <T extends Element = Element> (scope: SugarElement<Node>, selector: string): Optional<SugarElement<T>> =>
  PredicateFind.sibling(scope, (e): e is SugarElement<T> => Selectors.is<T>(e, selector));

const child = <T extends Element = Element> (scope: SugarElement<Node>, selector: string): Optional<SugarElement<T>> =>
  PredicateFind.child(scope, (e): e is SugarElement<T> => Selectors.is<T>(e, selector));

const descendant = <T extends Element = Element> (scope: SugarElement<Node>, selector: string): Optional<SugarElement<T>> =>
  Selectors.one<T>(selector, scope);

// Returns Some(closest ancestor element (sugared)) matching 'selector' up to isRoot, or None() otherwise
const closest = <T extends Element = Element> (scope: SugarElement<Node>, selector: string, isRoot?: (e: SugarElement<Node>) => boolean): Optional<SugarElement<T>> => {
  const is = (element: SugarElement<Node>, selector: string): element is SugarElement<T> => Selectors.is<T>(element, selector);
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
