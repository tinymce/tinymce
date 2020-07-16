import { Document, HTMLElement, Node } from '@ephox/dom-globals';
import { Arr, Fun, Option, Type } from '@ephox/katamari';
import * as Recurse from '../../alien/Recurse';
import * as Compare from '../dom/Compare';
import { SugarElement } from '../node/SugarElement';
import * as SugarNode from '../node/SugarNode';

/**
 * The document associated with the current element
 * NOTE: this will throw if the owner is null.
 */
const owner = (element: SugarElement<Node>) => SugarElement.fromDom(element.dom().ownerDocument);

/**
 * If the element is a document, return it. Otherwise, return its ownerDocument.
 * @param dos
 */
const documentOrOwner = (dos: SugarElement<Node>): SugarElement<Document> =>
  SugarNode.isDocument(dos) ? dos : owner(dos);

const documentElement = (element: SugarElement<Node>) => SugarElement.fromDom(element.dom().ownerDocument.documentElement);

// The window element associated with the element
const defaultView = (element: SugarElement<Node>) => SugarElement.fromDom(element.dom().ownerDocument.defaultView);

const parent = (element: SugarElement<Node>) => Option.from(element.dom().parentNode).map(SugarElement.fromDom);

const findIndex = (element: SugarElement<Node>) => parent(element).bind((p) => {
  // TODO: Refactor out children so we can avoid the constant unwrapping
  const kin = children(p);
  return Arr.findIndex(kin, (elem) => Compare.eq(element, elem));
});

const parents = (element: SugarElement<Node>, isRoot?: (e: SugarElement<Node>) => boolean) => {
  const stop = Type.isFunction(isRoot) ? isRoot : Fun.never;

  // This is used a *lot* so it needs to be performant, not recursive
  let dom: Node = element.dom();
  const ret: SugarElement<Node>[] = [];

  while (dom.parentNode !== null && dom.parentNode !== undefined) {
    const rawParent = dom.parentNode;
    const p = SugarElement.fromDom(rawParent);
    ret.push(p);

    if (stop(p) === true) {
      break;
    } else {
      dom = rawParent;
    }
  }
  return ret;
};

const siblings = (element: SugarElement<Node>) => {
  // TODO: Refactor out children so we can just not add self instead of filtering afterwards
  const filterSelf = <E> (elements: SugarElement<E>[]) => Arr.filter(elements, (x) => !Compare.eq(element, x));

  return parent(element).map(children).map(filterSelf).getOr([]);
};

const offsetParent = (element: SugarElement<HTMLElement>) => Option.from(element.dom().offsetParent as HTMLElement).map(SugarElement.fromDom);

const prevSibling = (element: SugarElement<Node>) => Option.from(element.dom().previousSibling).map(SugarElement.fromDom);

const nextSibling = (element: SugarElement<Node>) => Option.from(element.dom().nextSibling).map(SugarElement.fromDom);

// This one needs to be reversed, so they're still in DOM order
const prevSiblings = (element: SugarElement<Node>) => Arr.reverse(Recurse.toArray(element, prevSibling));

const nextSiblings = (element: SugarElement<Node>) => Recurse.toArray(element, nextSibling);

const children = (element: SugarElement<Node>) => Arr.map(element.dom().childNodes, SugarElement.fromDom);

const child = (element: SugarElement<Node>, index: number) => {
  const cs = element.dom().childNodes;
  return Option.from(cs[index] as Node).map(SugarElement.fromDom);
};

const firstChild = (element: SugarElement<Node>) => child(element, 0);

const lastChild = (element: SugarElement<Node>) => child(element, element.dom().childNodes.length - 1);

const childNodesCount = (element: SugarElement<Node>) => element.dom().childNodes.length;

const hasChildNodes = (element: SugarElement<Node>) => element.dom().hasChildNodes();

export interface ElementAndOffset<E> {
  readonly element: () => SugarElement<E>;
  readonly offset: () => number;
}

const spot = <E>(element: SugarElement<E>, offset: number): ElementAndOffset<E> => ({
  element: Fun.constant(element),
  offset: Fun.constant(offset)
});

const leaf = (element: SugarElement<Node>, offset: number): ElementAndOffset<Node> => {
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
