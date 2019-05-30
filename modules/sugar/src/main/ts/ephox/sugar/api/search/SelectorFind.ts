import * as PredicateFind from './PredicateFind';
import * as Selectors from './Selectors';
import ClosestOrAncestor from '../../impl/ClosestOrAncestor';
import Element from '../node/Element';
import { Option } from '@ephox/katamari';

// TODO: An internal SelectorFilter module that doesn't Element.fromDom() everything

const first = function (selector: string) {
  return Selectors.one(selector);
};

const ancestor = function (scope: Element, selector: string, isRoot?) {
  return PredicateFind.ancestor(scope, function (e) {
    return Selectors.is(e, selector);
  }, isRoot);
};

const sibling = function (scope: Element, selector: string) {
  return PredicateFind.sibling(scope, function (e) {
    return Selectors.is(e, selector);
  });
};

const child = function (scope: Element, selector: string) {
  return PredicateFind.child(scope, function (e) {
    return Selectors.is(e, selector);
  });
};

const descendant = function (scope: Element, selector: string) {
  return Selectors.one(selector, scope);
};

// Returns Some(closest ancestor element (sugared)) matching 'selector' up to isRoot, or None() otherwise
const closest = function (scope: Element, selector: string, isRoot?) {
  return ClosestOrAncestor(Selectors.is, ancestor, scope, selector, isRoot);
};

export {
  first,
  ancestor,
  sibling,
  child,
  descendant,
  closest,
};