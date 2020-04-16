import { Element as DomElement, Node as DomNode } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import * as ClassList from '../../impl/ClassList';
import Element from '../node/Element';
import * as Class from './Class';

/*
 * ClassList is IE10 minimum:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
 */
const add = (element: Element<DomElement>, classes: string[]) => {
  Arr.each(classes, (x) => {
    Class.add(element, x);
  });
};

const remove = (element: Element<DomElement>, classes: string[]) => {
  Arr.each(classes, (x) => {
    Class.remove(element, x);
  });
};

const toggle = (element: Element<DomElement>, classes: string[]) => {
  Arr.each(classes, (x) => {
    Class.toggle(element, x);
  });
};

const hasAll = (element: Element<DomNode>, classes: string[]) => Arr.forall(classes, (clazz) => Class.has(element, clazz));

const hasAny = (element: Element<DomNode>, classes: string[]) => Arr.exists(classes, (clazz) => Class.has(element, clazz));

const getNative = (element: Element<DomElement>) => {
  const classList = element.dom().classList;
  const r: Array<string> = new Array(classList.length);
  for (let i = 0; i < classList.length; i++) {
    const item = classList.item(i);
    if (item !== null) {
      r[i] = item;
    }
  }
  return r;
};

const get = (element: Element<DomElement>) => ClassList.supports(element) ? getNative(element) : ClassList.get(element);

export {
  add,
  remove,
  toggle,
  hasAll,
  hasAny,
  get
};
