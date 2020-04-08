import { ChildNode, Element as DomElement, Node as DomNode } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import * as Compare from '../dom/Compare';
import Element from '../node/Element';
import * as PredicateFind from './PredicateFind';
import * as SelectorFilter from './SelectorFilter';
import * as SelectorFind from './SelectorFind';
import * as Traverse from './Traverse';

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

const inAncestor = <A, D, E> (ancestor: Element<A>, descendants: Element<D>[], element: Element<E>, index: number): AddressInAncestor<A, D, E> => ({
  ancestor: Fun.constant(ancestor),
  descendants: Fun.constant(descendants),
  element: Fun.constant(element),
  index: Fun.constant(index)
});

const inParent = <P, C, E>(parent: Element<P>, children: Element<C>[], element: Element<E>, index: number): AddressInParent<P, C, E> => ({
  parent: Fun.constant(parent),
  children: Fun.constant(children),
  element: Fun.constant(element),
  index: Fun.constant(index)
});

const childOf = (element: Element<DomNode>, ancestor: Element<DomNode>) =>
  PredicateFind.closest(element, (elem) =>
    Traverse.parent(elem).exists((parent) => Compare.eq(parent, ancestor)));

const indexInParent = <E extends DomNode> (element: Element<E>) => Traverse.parent(element).bind((parent) => {
  const children = Traverse.children(parent);
  return indexOf(children, element).map((index) => inParent(parent, children, element as Element<E & DomNode & ChildNode>, index));
});

const indexOf = (elements: Element<DomNode>[], element: Element<DomNode>) => Arr.findIndex(elements, Fun.curry(Compare.eq, element));

const selectorsInParent = <E extends DomNode, S extends DomElement = DomElement> (element: Element<E>, selector: string) =>
  Traverse.parent(element).bind((parent) => {
    const children = SelectorFilter.children<S>(parent, selector);
    return indexOf(children, element).map((index) => inParent(parent, children, element as Element<E & S>, index));
  });

const descendantsInAncestor = <E extends DomNode, A extends DomElement = DomElement, D extends DomElement = DomElement> (element: Element<E>, ancestorSelector: string, descendantSelector: string) =>
  SelectorFind.closest<A>(element, ancestorSelector).bind((ancestor) => {
    const descendants = SelectorFilter.descendants<D>(ancestor, descendantSelector);
    return indexOf(descendants, element).map((index) => inAncestor(ancestor, descendants, element as Element<E & D>, index));
  });

export { childOf, indexOf, indexInParent, selectorsInParent, descendantsInAncestor };
