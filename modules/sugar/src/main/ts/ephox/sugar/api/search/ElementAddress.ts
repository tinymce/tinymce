import { Arr, Fun, Struct } from '@ephox/katamari';
import * as Compare from '../dom/Compare';
import Element from '../node/Element';
import * as PredicateFind from './PredicateFind';
import * as SelectorFilter from './SelectorFilter';
import * as SelectorFind from './SelectorFind';
import * as Traverse from './Traverse';

export interface AddressInAncestor {
  ancestor: () => Element;
  descendants: () => Element[];
  element: () => Element;
  index: () => number;
}

export interface AddressInParent {
  parent: () => Element;
  children: () => Element[];
  element: () => Element;
  index: () => number;
}

const inAncestor: (ancestor: Element, descendants: Element[], element: Element, index: number) => AddressInAncestor = Struct.immutable('ancestor', 'descendants', 'element', 'index');
const inParent: (parent: Element, children: Element[], element: Element, index: number) => AddressInParent = Struct.immutable('parent', 'children', 'element', 'index');

const childOf = function (element: Element, ancestor: Element) {
  return PredicateFind.closest(element, function (elem) {
    return Traverse.parent(elem).exists(function (parent) {
      return Compare.eq(parent, ancestor);
    });
  });
};

const indexInParent = function (element: Element) {
  return Traverse.parent(element).bind(function (parent) {
    const children = Traverse.children(parent);
    return indexOf(children, element).map(function (index) {
      return inParent(parent, children, element, index);
    });
  });
};

const indexOf = function (elements: Element[], element: Element) {
  return Arr.findIndex(elements, Fun.curry(Compare.eq, element));
};

const selectorsInParent = function (element: Element, selector: string) {
  return Traverse.parent(element).bind(function (parent) {
    const children = SelectorFilter.children(parent, selector);
    return indexOf(children, element).map(function (index) {
      return inParent(parent, children, element, index);
    });
  });
};

const descendantsInAncestor = function (element: Element, ancestorSelector: string, descendantSelector: string) {
  return SelectorFind.closest(element, ancestorSelector).bind(function (ancestor) {
    const descendants = SelectorFilter.descendants(ancestor, descendantSelector);
    return indexOf(descendants, element).map(function (index) {
      return inAncestor(ancestor, descendants, element, index);
    });
  });
};

export { childOf, indexOf, indexInParent, selectorsInParent, descendantsInAncestor, };
