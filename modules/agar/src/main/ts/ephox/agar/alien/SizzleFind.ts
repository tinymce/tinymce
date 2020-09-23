import { Arr, Optional } from '@ephox/katamari';
import { SugarElement, Traverse } from '@ephox/sugar';
import Sizzle from '@ephox/wrap-sizzle';

const toOptionEl = (output: Element[]): Optional<SugarElement<Element>> =>
  output.length === 0 ? Optional.none() : Optional.from(output[0]).map(SugarElement.fromDom);

/* Petrie makes extensive use of :visible, :has() and :contains() which are sizzle extensions */
const descendant = (sugarElement: SugarElement<any>, selector: string): Optional<SugarElement<Element>> => {
  const siz: Element[] = Sizzle(selector, sugarElement.dom);
  return toOptionEl(siz);
};

const toArrayEl = (elements: (Node | Window)[]): SugarElement<Node | Window>[] =>
  Arr.map(elements, SugarElement.fromDom);

/* Petrie makes extensive use of :visible, :has() and :contains() which are sizzle extensions */
const descendants = (sugarElement: SugarElement<any>, selector: string): SugarElement<any>[] =>
  toArrayEl(Sizzle(selector, sugarElement.dom));

const matches = (sugarElement: SugarElement<any>, selector: string): boolean =>
  Sizzle.matchesSelector(sugarElement.dom, selector);

const child = (sugarElement: SugarElement<any>, selector: string): Optional<SugarElement<any>> => {
  const children = Traverse.children(sugarElement);
  return Arr.find(children, (child) => matches(child, selector));
};

const children = (sugarElement: SugarElement<any>, selector: string): SugarElement<any>[] => {
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
