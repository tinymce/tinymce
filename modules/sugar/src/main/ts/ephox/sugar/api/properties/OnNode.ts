import { SugarElement } from '../node/SugarElement';
import * as Class from './Class';
import * as Classes from './Classes';

const addClass = (clazz: string) => (element: SugarElement<Element>): void => {
  Class.add(element, clazz);
};

const removeClass = (clazz: string) => (element: SugarElement<Element>): void => {
  Class.remove(element, clazz);
};

const removeClasses = (classes: string[]) => (element: SugarElement<Element>): void => {
  Classes.remove(element, classes);
};

const hasClass = (clazz: string) => (element: SugarElement<Node>): boolean =>
  Class.has(element, clazz);

export {
  addClass,
  removeClass,
  removeClasses,
  hasClass
};
