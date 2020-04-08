import { Element as DomElement, Node as DomNode } from '@ephox/dom-globals';
import Element from '../node/Element';
import * as Class from './Class';
import * as Classes from './Classes';

const addClass = (clazz: string) => (element: Element<DomElement>) => {
  Class.add(element, clazz);
};

const removeClass = (clazz: string) => (element: Element<DomElement>) => {
  Class.remove(element, clazz);
};

const removeClasses = (classes: string[]) => (element: Element<DomElement>) => {
  Classes.remove(element, classes);
};

const hasClass = (clazz: string) => (element: Element<DomNode>) => Class.has(element, clazz);

export {
  addClass,
  removeClass,
  removeClasses,
  hasClass
};
