import { Element as DomElement, Node, Window } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import { Element, Traverse } from '@ephox/sugar';
import Sizzle from '@ephox/wrap-sizzle';

const toOptionEl = (output: DomElement[]): Option<Element<DomElement>> =>
  output.length === 0 ? Option.none() : Option.from(output[0]).map(Element.fromDom);

/* Petrie makes extensive use of :visible, :has() and :contains() which are sizzle extensions */
const descendant = (sugarElement: Element<any>, selector: string): Option<Element<DomElement>> => {
  const siz: DomElement[] = Sizzle(selector, sugarElement.dom());
  return toOptionEl(siz);
};

const toArrayEl = (elements: (Node | Window)[]): Element<Node | Window>[] =>
  Arr.map(elements, Element.fromDom);

/* Petrie makes extensive use of :visible, :has() and :contains() which are sizzle extensions */
const descendants = (sugarElement: Element<any>, selector: string): Element<any>[] =>
  toArrayEl(Sizzle(selector, sugarElement.dom()));

const matches = (sugarElement: Element<any>, selector: string): boolean =>
  Sizzle.matchesSelector(sugarElement.dom(), selector);

const child = (sugarElement: Element<any>, selector: string): Option<Element<any>> => {
  const children = Traverse.children(sugarElement);
  return Arr.find(children, (child) => matches(child, selector));
};

const children = (sugarElement: Element<any>, selector: string): Element<any>[] => {
  const children = Traverse.children(sugarElement);
  return Arr.filter(children, (child) => matches(child, selector));
};

export {
  descendant,
  descendants,
  matches,
  child,
  children
};
