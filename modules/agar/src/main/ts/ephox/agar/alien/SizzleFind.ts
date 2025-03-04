import { Arr, Optional } from '@ephox/katamari';
import { SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import * as SelectorEngine from './SelectorEngine';

type SizzleContext = Element | Document | DocumentFragment;

const toOptionEl = <T extends Element>(output: T[]): Optional<SugarElement<T>> =>
  output.length === 0 ? Optional.none() : Optional.from(output[0]).map(SugarElement.fromDom);

const descendant = <T extends Element>(sugarElement: SugarElement<SizzleContext>, selector: string): Optional<SugarElement<T>> => {
  const siz = SelectorEngine.selectAll(selector, sugarElement.dom) as T[];
  return toOptionEl(siz);
};

const toArrayEl = <T extends Node | Window>(elements: T[]): SugarElement<T>[] =>
  Arr.map(elements, SugarElement.fromDom);

const descendants = <T extends Element>(sugarElement: SugarElement<SizzleContext>, selector: string): SugarElement<T>[] =>
  toArrayEl(SelectorEngine.selectAll(selector, sugarElement.dom) as T[]);

const matches = <T extends Element>(sugarElement: SugarElement<Node>, selector: string): sugarElement is SugarElement<T> =>
  SugarNode.isElement(sugarElement) && SelectorEngine.matchesSelector(sugarElement.dom, selector);

const child = <T extends Element>(sugarElement: SugarElement<Node>, selector: string): Optional<SugarElement<T>> => {
  const children = Traverse.children(sugarElement);
  return Arr.find(children, (child): child is SugarElement<T> => matches(child, selector));
};

const children = <T extends Element>(sugarElement: SugarElement<Node>, selector: string): SugarElement<T>[] => {
  const children = Traverse.children(sugarElement);
  return Arr.filter(children, (child): child is SugarElement<T> => matches(child, selector));
};

export {
  descendant,
  descendants,
  matches,
  child,
  children
};
