import { Arr, Fun, Struct } from '@ephox/katamari';
import * as Compare from '../dom/Compare';
import Element from '../node/Element';
import * as PredicateFind from './PredicateFind';
import * as SelectorFilter from './SelectorFilter';
import * as SelectorFind from './SelectorFind';
import * as Traverse from './Traverse';
import { Node as DomNode, Element as DomElement, ChildNode } from '@ephox/dom-globals';

export interface AddressInAncestor<A, D, E> {
  ancestor: () => Element<A>;
  descendants: () => Element<D>[];
  element: () => Element<E>;
  index: () => number;
}

export interface AddressInParent<P, C, E> {
  parent: () => Element<P>;
  children: () => Element<C>[];
  element: () => Element<E>;
  index: () => number;
}

const inAncestor: <A, D, E> (ancestor: Element<A>, descendants: Element<D>[], element: Element<E>, index: number) => AddressInAncestor<A, D, E> = Struct.immutable('ancestor', 'descendants', 'element', 'index');
const inParent: <P, C, E>(parent: Element<P>, children: Element<C>[], element: Element<E>, index: number) => AddressInParent<P, C, E> = Struct.immutable('parent', 'children', 'element', 'index');

const childOf = function (element: Element<DomNode>, ancestor: Element<DomNode>) {
  return PredicateFind.closest(element, function (elem) {
    return Traverse.parent(elem).exists(function (parent) {
      return Compare.eq(parent, ancestor);
    });
  });
};

const indexInParent = function <E extends DomNode> (element: Element<E>) {
  return Traverse.parent(element).bind(function (parent) {
    const children = Traverse.children(parent);
    return indexOf(children, element).map(function (index) {
      return inParent(parent, children, element as Element<E & DomNode & ChildNode>, index);
    });
  });
};

const indexOf = function (elements: Element<DomNode>[], element: Element<DomNode>) {
  return Arr.findIndex(elements, Fun.curry(Compare.eq, element));
};

const selectorsInParent = function <E extends DomNode, S extends DomElement = DomElement>(element: Element<E>, selector: string) {
  return Traverse.parent(element).bind(function (parent) {
    const children = SelectorFilter.children<S>(parent, selector);
    return indexOf(children, element).map(function (index) {
      return inParent(parent, children, element as Element<E & S>, index);
    });
  });
};

const descendantsInAncestor = function <E extends DomNode, A extends DomElement = DomElement, D extends DomElement = DomElement>(element: Element<E>, ancestorSelector: string, descendantSelector: string) {
  return SelectorFind.closest<A>(element, ancestorSelector).bind(function (ancestor) {
    const descendants = SelectorFilter.descendants<D>(ancestor, descendantSelector);
    return indexOf(descendants, element).map(function (index) {
      return inAncestor(ancestor, descendants, element as Element<E & D>, index);
    });
  });
};

export { childOf, indexOf, indexInParent, selectorsInParent, descendantsInAncestor, };
