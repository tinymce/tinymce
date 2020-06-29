import { Document, HTMLElement, Node as DomNode } from '@ephox/dom-globals';
import { Arr, Fun, Option, Type } from '@ephox/katamari';
import * as Recurse from '../../alien/Recurse';
import * as Compare from '../dom/Compare';
import Element from '../node/Element';
import * as Node from '../node/Node';

/**
 * The document associated with the current element
 * NOTE: this will throw if the owner is null.
 */
const owner = (element: Element<DomNode>) => Element.fromDom(element.dom().ownerDocument);

/**
 * If the element is a document, return it. Otherwise, return its ownerDocument.
 * @param dos
 */
const documentOrOwner = (dos: Element<DomNode>): Element<Document> =>
  Node.isDocument(dos) ? dos : owner(dos);

const documentElement = (element: Element<DomNode>) => Element.fromDom(element.dom().ownerDocument.documentElement);

// The window element associated with the element
const defaultView = (element: Element<DomNode>) => Element.fromDom(element.dom().ownerDocument.defaultView);

const parent = (element: Element<DomNode>) => Option.from(element.dom().parentNode).map(Element.fromDom);

const findIndex = (element: Element<DomNode>) => parent(element).bind((p) => {
  // TODO: Refactor out children so we can avoid the constant unwrapping
  const kin = children(p);
  return Arr.findIndex(kin, (elem) => Compare.eq(element, elem));
});

const parents = (element: Element<DomNode>, isRoot?: (e: Element<DomNode>) => boolean) => {
  const stop = Type.isFunction(isRoot) ? isRoot : Fun.never;

  // This is used a *lot* so it needs to be performant, not recursive
  let dom: DomNode = element.dom();
  const ret: Element<DomNode>[] = [];

  while (dom.parentNode !== null && dom.parentNode !== undefined) {
    const rawParent = dom.parentNode;
    const p = Element.fromDom(rawParent);
    ret.push(p);

    if (stop(p) === true) {
      break;
    } else {
      dom = rawParent;
    }
  }
  return ret;
};

const siblings = (element: Element<DomNode>) => {
  // TODO: Refactor out children so we can just not add self instead of filtering afterwards
  const filterSelf = <E> (elements: Element<E>[]) => Arr.filter(elements, (x) => !Compare.eq(element, x));

  return parent(element).map(children).map(filterSelf).getOr([]);
};

const offsetParent = (element: Element<HTMLElement>) => Option.from(element.dom().offsetParent as HTMLElement).map(Element.fromDom);

const prevSibling = (element: Element<DomNode>) => Option.from(element.dom().previousSibling).map(Element.fromDom);

const nextSibling = (element: Element<DomNode>) => Option.from(element.dom().nextSibling).map(Element.fromDom);

// This one needs to be reversed, so they're still in DOM order
const prevSiblings = (element: Element<DomNode>) => Arr.reverse(Recurse.toArray(element, prevSibling));

const nextSiblings = (element: Element<DomNode>) => Recurse.toArray(element, nextSibling);

const children = (element: Element<DomNode>) => Arr.map(element.dom().childNodes, Element.fromDom);

const child = (element: Element<DomNode>, index: number) => {
  const cs = element.dom().childNodes;
  return Option.from(cs[index] as DomNode).map(Element.fromDom);
};

const firstChild = (element: Element<DomNode>) => child(element, 0);

const lastChild = (element: Element<DomNode>) => child(element, element.dom().childNodes.length - 1);

const childNodesCount = (element: Element<DomNode>) => element.dom().childNodes.length;

const hasChildNodes = (element: Element<DomNode>) => element.dom().hasChildNodes();

export interface ElementAndOffset<E> {
  readonly element: () => Element<E>;
  readonly offset: () => number;
}

const spot = <E>(element: Element<E>, offset: number): ElementAndOffset<E> => ({
  element: Fun.constant(element),
  offset: Fun.constant(offset)
});

const leaf = (element: Element<DomNode>, offset: number): ElementAndOffset<DomNode> => {
  const cs = children(element);
  return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
};

export {
  owner,
  documentOrOwner,
  defaultView,
  documentElement,
  parent,
  findIndex,
  parents,
  siblings,
  prevSibling,
  offsetParent,
  prevSiblings,
  nextSibling,
  nextSiblings,
  children,
  child,
  firstChild,
  lastChild,
  childNodesCount,
  hasChildNodes,
  leaf
};
