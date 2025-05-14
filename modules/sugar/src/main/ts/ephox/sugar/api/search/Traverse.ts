import { Arr, Fun, Optional, Type } from '@ephox/katamari';

import * as Recurse from '../../alien/Recurse';
import * as Compare from '../dom/Compare';
import { SugarElement } from '../node/SugarElement';
import * as SugarNode from '../node/SugarNode';

/**
 * The document associated with the current element
 * NOTE: this will throw if the owner is null.
 */
const owner = (element: SugarElement<Node>): SugarElement<Document> =>
  SugarElement.fromDom(element.dom.ownerDocument as Document);

/**
 * If the element is a document, return it. Otherwise, return its ownerDocument.
 * @param dos
 */
const documentOrOwner = (dos: SugarElement<Node>): SugarElement<Document> =>
  SugarNode.isDocument(dos) ? dos : owner(dos);

const documentElement = (element: SugarElement<Node>): SugarElement<HTMLElement> =>
  SugarElement.fromDom(documentOrOwner(element).dom.documentElement);

/**
 * The window element associated with the element
 * NOTE: this will throw if the defaultView is null.
 */
const defaultView = (element: SugarElement<Node>): SugarElement<Window> =>
  SugarElement.fromDom(documentOrOwner(element).dom.defaultView as Window);

const parent = (element: SugarElement<Node>): Optional<SugarElement<Node & ParentNode>> =>
  Optional.from(element.dom.parentNode).map(SugarElement.fromDom);

// Cast down to just be SugarElement<Node>
const parentNode = (element: SugarElement<Node>): Optional<SugarElement<Node>> =>
  parent(element) as any;

const parentElement = (element: SugarElement<Node>): Optional<SugarElement<HTMLElement>> =>
  Optional.from(element.dom.parentElement).map(SugarElement.fromDom);

const findIndex = (element: SugarElement<Node>): Optional<number> =>
  parent(element).bind((p) => {
    // TODO: Refactor out children so we can avoid the constant unwrapping
    const kin = children(p);
    return Arr.findIndex(kin, (elem) => Compare.eq(element, elem));
  });

const parents = (element: SugarElement<Node>, isRoot?: (e: SugarElement<Node>) => boolean): SugarElement<Node>[] => {
  const stop = Type.isFunction(isRoot) ? isRoot : Fun.never;

  // This is used a *lot* so it needs to be performant, not recursive
  let dom: Node = element.dom;
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

const siblings = (element: SugarElement<Node>): SugarElement<Node>[] => {
  // TODO: Refactor out children so we can just not add self instead of filtering afterwards
  const filterSelf = <E> (elements: SugarElement<E>[]) => Arr.filter(elements, (x) => !Compare.eq(element, x));

  return parent(element).map(children).map(filterSelf).getOr([]);
};

const offsetParent = (element: SugarElement<HTMLElement>): Optional<SugarElement<HTMLElement>> =>
  Optional.from(element.dom.offsetParent as HTMLElement).map(SugarElement.fromDom);

const prevSibling = (element: SugarElement<Node>): Optional<SugarElement<Node & ChildNode>> =>
  Optional.from(element.dom.previousSibling).map(SugarElement.fromDom);

const nextSibling = (element: SugarElement<Node>): Optional<SugarElement<Node & ChildNode>> =>
  Optional.from(element.dom.nextSibling).map(SugarElement.fromDom);

// This one needs to be reversed, so they're still in DOM order
const prevSiblings = (element: SugarElement<Node>): SugarElement<Node & ChildNode>[] =>
  Arr.reverse(Recurse.toArray(element, prevSibling));

const nextSiblings = (element: SugarElement<Node>): SugarElement<Node & ChildNode>[] =>
  Recurse.toArray(element, nextSibling);

const children = (element: SugarElement<Node>): SugarElement<Node & ChildNode>[] =>
  Arr.map(element.dom.childNodes, SugarElement.fromDom);

const child = (element: SugarElement<Node>, index: number): Optional<SugarElement<Node & ChildNode>> => {
  const cs = element.dom.childNodes;
  return Optional.from(cs[index]).map(SugarElement.fromDom);
};

const firstChild = (element: SugarElement<Node>): Optional<SugarElement<Node & ChildNode>> =>
  child(element, 0);

const lastChild = (element: SugarElement<Node>): Optional<SugarElement<Node & ChildNode>> =>
  child(element, element.dom.childNodes.length - 1);

const childNodesCount = (element: SugarElement<Node>): number =>
  element.dom.childNodes.length;

const hasChildNodes = (element: SugarElement<Node>): boolean =>
  element.dom.hasChildNodes();

export interface ElementAndOffset<E> {
  readonly element: SugarElement<E>;
  readonly offset: number;
}

const spot = <E>(element: SugarElement<E>, offset: number): ElementAndOffset<E> => ({
  element,
  offset
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
  parentNode,
  parentElement,
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
