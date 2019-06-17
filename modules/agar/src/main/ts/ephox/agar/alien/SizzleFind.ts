import { Element as DomElement, Node, Window } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import { Element, Traverse } from '@ephox/sugar';
import Sizzle from '@ephox/wrap-sizzle';

const toOptionEl = function (output: DomElement[]): Option<Element> {
  return output.length === 0 ? Option.none() : Option.from(output[0]).map(Element.fromDom);
};

/* Petrie makes extensive use of :visible, :has() and :contains() which are sizzle extensions */
const descendant = function (sugarElement: Element, selector: string): Option<Element> {
  const siz: DomElement[] = Sizzle(selector, sugarElement.dom());
  return toOptionEl(siz);
};

const toArrayEl = function (elements: (Node | Window)[]): Element[] {
  return Arr.map(elements, Element.fromDom);
}

/* Petrie makes extensive use of :visible, :has() and :contains() which are sizzle extensions */
const descendants = function (sugarElement: Element, selector: string): Element[] {
  return toArrayEl(Sizzle(selector, sugarElement.dom()));
};

const matches = function (sugarElement: Element, selector: string): boolean {
  return Sizzle.matchesSelector(sugarElement.dom(), selector);
};

const child = function (sugarElement: Element, selector: string): Option<Element> {
  const children = Traverse.children(sugarElement);
  return Arr.find(children, function (child) {
    return matches(child, selector);
  });
};

const children = function (sugarElement: Element, selector: string): Element[] {
  const children = Traverse.children(sugarElement);
  return Arr.filter(children, function (child) {
    return matches(child, selector);
  });
};

export {
  descendant,
  descendants,
  matches,
  child,
  children
};