import { HTMLElement, Node as DomNode, Element as DomElement } from '@ephox/dom-globals';
import { Arr, Fun, Option, Struct, Type } from '@ephox/katamari';
import Recurse from '../../alien/Recurse';
import * as Compare from '../dom/Compare';
import Element from '../node/Element';

// The document associated with the current element
const owner = function (element: Element<DomNode>) {
  return Element.fromDom(element.dom().ownerDocument);
};

const documentElement = function (element: Element<DomNode>) {
  return Element.fromDom(element.dom().ownerDocument.documentElement);
};

// The window element associated with the element
const defaultView = function (element: Element<DomNode>) {
  return Element.fromDom(element.dom().ownerDocument.defaultView);
};

const parent = function (element: Element<DomNode>) {
  return Option.from(element.dom().parentNode).map(Element.fromDom);
};

const findIndex = function (element: Element<DomNode>) {
  return parent(element).bind(function (p) {
    // TODO: Refactor out children so we can avoid the constant unwrapping
    const kin = children(p);
    return Arr.findIndex(kin, function (elem) {
      return Compare.eq(element, elem);
    });
  });
};

const parents = function (element: Element<DomNode>, isRoot?: (e: Element<DomNode>) => boolean) {
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

const siblings = function (element: Element<DomNode>) {
  // TODO: Refactor out children so we can just not add self instead of filtering afterwards
  const filterSelf = function <E> (elements: Element<E>[]) {
    return Arr.filter(elements, function (x) {
      return !Compare.eq(element, x);
    });
  };

  return parent(element).map(children).map(filterSelf).getOr([]);
};

const offsetParent = function (element: Element<HTMLElement>) {
  return Option.from(element.dom().offsetParent).map(Element.fromDom);
};

const prevSibling = function (element: Element<DomNode>) {
  return Option.from(element.dom().previousSibling).map(Element.fromDom);
};

const nextSibling = function (element: Element<DomNode>) {
  return Option.from(element.dom().nextSibling).map(Element.fromDom);
};

const prevSiblings = function (element: Element<DomNode>) {
  // This one needs to be reversed, so they're still in DOM order
  return Arr.reverse(Recurse.toArray(element, prevSibling));
};

const nextSiblings = function (element: Element<DomNode>) {
  return Recurse.toArray(element, nextSibling);
};

const children = function (element: Element<DomNode>) {
  return Arr.map(element.dom().childNodes, Element.fromDom);
};

const child = function (element: Element<DomNode>, index: number) {
  const cs = element.dom().childNodes;
  return Option.from(cs[index] as DomNode).map(Element.fromDom);
};

const firstChild = function (element: Element<DomNode>) {
  return child(element, 0);
};

const lastChild = function (element: Element<DomNode>) {
  return child(element, element.dom().childNodes.length - 1);
};

const childNodesCount = function (element: Element<DomNode>) {
  return element.dom().childNodes.length;
};

const hasChildNodes = function (element: Element<DomNode>) {
  return element.dom().hasChildNodes();
};

const spot: <E>(element: Element<E>, offset: number) => {
  element: () => Element<E>;
  offset: () => number;
} = Struct.immutable('element', 'offset');

const leaf = function (element: Element<DomNode>, offset: number) {
  const cs = children(element);
  return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
};

export { owner, defaultView, documentElement, parent, findIndex, parents, siblings, prevSibling, offsetParent, prevSiblings, nextSibling, nextSiblings, children, child, firstChild, lastChild, childNodesCount, hasChildNodes, leaf, };
