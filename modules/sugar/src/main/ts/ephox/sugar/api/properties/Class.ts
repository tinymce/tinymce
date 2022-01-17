import * as ClassList from '../../impl/ClassList';
import { SugarElement } from '../node/SugarElement';
import * as Attribute from './Attribute';
import { Toggler } from './Toggler';

/*
 * ClassList is IE10 minimum:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
 *
 * Note that IE doesn't support the second argument to toggle (at all).
 * If it did, the toggler could be better.
 */

const add = (element: SugarElement<Element>, clazz: string): void => {
  if (ClassList.supports(element)) {
    element.dom.classList.add(clazz);
  } else {
    ClassList.add(element, clazz);
  }
};

const cleanClass = (element: SugarElement<Element>): void => {
  const classList = ClassList.supports(element) ? element.dom.classList : ClassList.get(element);
  // classList is a "live list", so this is up to date already
  if (classList.length === 0) {
    // No more classes left, remove the class attribute as well
    Attribute.remove(element, 'class');
  }
};

const remove = (element: SugarElement<Element>, clazz: string): void => {
  if (ClassList.supports(element)) {
    const classList = element.dom.classList;
    classList.remove(clazz);
  } else {
    ClassList.remove(element, clazz);
  }

  cleanClass(element);
};

const toggle = (element: SugarElement<Element>, clazz: string): boolean => {
  const result = ClassList.supports(element) ? element.dom.classList.toggle(clazz) : ClassList.toggle(element, clazz);
  cleanClass(element);
  return result;
};

const toggler = (element: SugarElement<Element>, clazz: string): Toggler => {
  const hasClasslist = ClassList.supports(element);
  const classList = element.dom.classList;
  const off = () => {
    if (hasClasslist) {
      classList.remove(clazz);
    } else {
      ClassList.remove(element, clazz);
    }
    cleanClass(element);
  };
  const on = () => {
    if (hasClasslist) {
      classList.add(clazz);
    } else {
      ClassList.add(element, clazz);
    }
  };
  return Toggler(off, on, has(element, clazz));
};

const has = (element: SugarElement<Node>, clazz: string): boolean =>
  ClassList.supports(element) && element.dom.classList.contains(clazz);

export {
  add,
  remove,
  toggle,
  toggler,
  has
};
