import { HTMLElement as DomElement, Node as DomNode } from '@ephox/dom-globals';
import { Arr, Fun, Option, Struct, Type } from '@ephox/katamari';
import Recurse from '../../alien/Recurse';
import * as Compare from '../dom/Compare';
import Element from '../node/Element';

// The document associated with the current element
const owner = function (element: Element) {
  return Element.fromDom((element.dom() as DomNode).ownerDocument);
};

const documentElement = function (element: Element) {
  return Element.fromDom((element.dom() as DomNode).ownerDocument.documentElement);
};

// The window element associated with the element
const defaultView = function (element: Element) {
  const el: DomNode = element.dom();
  const defView = el.ownerDocument.defaultView;
  return Element.fromDom(defView);
};

const parent = function (element: Element) {
  const dom: DomNode = element.dom();
  return Option.from(dom.parentNode).map(Element.fromDom);
};

const findIndex = function (element: Element) {
  return parent(element).bind(function (p: Element) {
    // TODO: Refactor out children so we can avoid the constant unwrapping
    const kin = children(p);
    return Arr.findIndex(kin, function (elem) {
      return Compare.eq(element, elem);
    });
  });
};

const parents = function (element: Element, isRoot) {
  const stop = Type.isFunction(isRoot) ? isRoot : Fun.constant(false);

  // This is used a *lot* so it needs to be performant, not recursive
  let dom: DomNode = element.dom();
  const ret: Element[] = [];

  while (dom.parentNode !== null && dom.parentNode !== undefined) {
    const rawParent = dom.parentNode;
    const p = Element.fromDom(rawParent);
    ret.push(p);

    if (stop(p) === true) { break; } else { dom = rawParent; }
  }
  return ret;
};

const siblings = function (element: Element) {
  // TODO: Refactor out children so we can just not add self instead of filtering afterwards
  const filterSelf = function (elements: Element[]) {
    return Arr.filter(elements, function (x) {
      return !Compare.eq(element, x);
    });
  };

  return parent(element).map(children).map(filterSelf).getOr([]);
};

const offsetParent = function (element: Element) {
  const dom: DomElement = element.dom();
  return Option.from(dom.offsetParent).map(Element.fromDom);
};

const prevSibling = function (element: Element) {
  const dom: DomNode = element.dom();
  return Option.from(dom.previousSibling).map(Element.fromDom);
};

const nextSibling = function (element: Element) {
  const dom: DomNode = element.dom();
  return Option.from(dom.nextSibling).map(Element.fromDom);
};

const prevSiblings = function (element: Element) {
  // This one needs to be reversed, so they're still in DOM order
  return Arr.reverse(Recurse.toArray(element, prevSibling));
};

const nextSiblings = function (element: Element) {
  return Recurse.toArray(element, nextSibling);
};

const children = function (element: Element) {
  // TypeScript doesn't like specifying the type here, because childNodes is not a real array
  const dom = element.dom();
  return Arr.map(dom.childNodes, Element.fromDom);
};

const child = function (element: Element, index: number) {
  const cs = (element.dom() as DomNode).childNodes;
  return Option.from(cs[index]).map(Element.fromDom);
};

const firstChild = function (element: Element) {
  return child(element, 0);
};

const lastChild = function (element: Element) {
  return child(element, (element.dom() as DomNode).childNodes.length - 1);
};

const childNodesCount = function (element: Element) {
  return (element.dom() as DomNode).childNodes.length;
};

const hasChildNodes = function (element: Element) {
  return (element.dom() as DomNode).hasChildNodes();
};

const spot = Struct.immutable('element', 'offset');
const leaf = function (element: Element, offset: number) {
  const cs = children(element);
  return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
};

export { owner, defaultView, documentElement, parent, findIndex, parents, siblings, prevSibling, offsetParent, prevSiblings, nextSibling, nextSiblings, children, child, firstChild, lastChild, childNodesCount, hasChildNodes, leaf, };
