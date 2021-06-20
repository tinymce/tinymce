import { Arr } from '@ephox/katamari';

import * as ClassList from '../../impl/ClassList';
import { SugarElement } from '../node/SugarElement';
import * as Class from './Class';

/*
 * ClassList is IE10 minimum:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
 */
const add = (element: SugarElement<Element>, classes: string[]): void => {
  Arr.each(classes, (x) => {
    Class.add(element, x);
  });
};

const remove = (element: SugarElement<Element>, classes: string[]): void => {
  Arr.each(classes, (x) => {
    Class.remove(element, x);
  });
};

const toggle = (element: SugarElement<Element>, classes: string[]): void => {
  Arr.each(classes, (x) => {
    Class.toggle(element, x);
  });
};

const hasAll = (element: SugarElement<Node>, classes: string[]): boolean =>
  Arr.forall(classes, (clazz) => Class.has(element, clazz));

const hasAny = (element: SugarElement<Node>, classes: string[]): boolean =>
  Arr.exists(classes, (clazz) => Class.has(element, clazz));

const getNative = (element: SugarElement<Element>): string[] => {
  const classList = element.dom.classList;
  const r: Array<string> = new Array(classList.length);
  for (let i = 0; i < classList.length; i++) {
    const item = classList.item(i);
    if (item !== null) {
      r[i] = item;
    }
  }
  return r;
};

const get = (element: SugarElement<Element>): string[] =>
  ClassList.supports(element) ? getNative(element) : ClassList.get(element);

export {
  add,
  remove,
  toggle,
  hasAll,
  hasAny,
  get
};
