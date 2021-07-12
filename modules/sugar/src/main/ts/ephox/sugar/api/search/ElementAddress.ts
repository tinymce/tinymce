import { Arr, Fun, Optional } from '@ephox/katamari';

import * as Compare from '../dom/Compare';
import { SugarElement } from '../node/SugarElement';
import * as PredicateFind from './PredicateFind';
import * as SelectorFilter from './SelectorFilter';
import * as SelectorFind from './SelectorFind';
import * as Traverse from './Traverse';

export interface AddressInAncestor<A, D, E> {
  readonly ancestor: SugarElement<A>;
  readonly descendants: ReadonlyArray<SugarElement<D>>;
  readonly element: SugarElement<E>;
  readonly index: number;
}

export interface AddressInParent<P, C, E> {
  readonly parent: SugarElement<P>;
  readonly children: ReadonlyArray<SugarElement<C>>;
  readonly element: SugarElement<E>;
  readonly index: number;
}

const inAncestor = <A, D, E> (ancestor: SugarElement<A>, descendants: SugarElement<D>[], element: SugarElement<E>, index: number): AddressInAncestor<A, D, E> => ({
  ancestor,
  descendants,
  element,
  index
});

const inParent = <P, C, E>(parent: SugarElement<P>, children: SugarElement<C>[], element: SugarElement<E>, index: number): AddressInParent<P, C, E> => ({
  parent,
  children,
  element,
  index
});

const childOf = (element: SugarElement<Node>, ancestor: SugarElement<Node>): Optional<SugarElement<Node>> =>
  PredicateFind.closest(element, (elem) =>
    Traverse.parent(elem).exists((parent) => Compare.eq(parent, ancestor)));

const indexInParent = <E extends Node> (element: SugarElement<E>): Optional<AddressInParent<Node & ParentNode, Node & ChildNode, E>> =>
  Traverse.parent(element).bind((parent) => {
    const children = Traverse.children(parent);
    return indexOf(children, element).map((index) => inParent(parent, children, element, index));
  });

const indexOf = (elements: SugarElement<Node>[], element: SugarElement<Node>): Optional<number> =>
  Arr.findIndex(elements, Fun.curry(Compare.eq, element));

const selectorsInParent = <E extends Node, S extends Element = Element> (element: SugarElement<E>, selector: string): Optional<AddressInParent<Node & ParentNode, S, E>> =>
  Traverse.parent(element).bind((parent) => {
    const children = SelectorFilter.children<S>(parent, selector);
    return indexOf(children, element).map((index) => inParent(parent, children, element, index));
  });

const descendantsInAncestor = <E extends Node, A extends Element = Element, D extends Element = Element> (element: SugarElement<E>, ancestorSelector: string, descendantSelector: string): Optional<AddressInAncestor<A, D, E>> =>
  SelectorFind.closest<A>(element, ancestorSelector).bind((ancestor) => {
    const descendants = SelectorFilter.descendants<D>(ancestor, descendantSelector);
    return indexOf(descendants, element).map((index) => inAncestor(ancestor, descendants, element, index));
  });

export { childOf, indexOf, indexInParent, selectorsInParent, descendantsInAncestor };
