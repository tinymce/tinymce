import Toggler from './Toggler';
import * as Attr from './Attr';
import * as ClassList from '../../impl/ClassList';
import Element from '../node/Element';
import { Element as DomElement, Node } from '@ephox/dom-globals';

/*
 * ClassList is IE10 minimum:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
 *
 * Note that IE doesn't support the second argument to toggle (at all).
 * If it did, the toggler could be better.
 */

const add = function (element: Element<DomElement>, clazz: string) {
  if (ClassList.supports(element)) {
    element.dom().classList.add(clazz);
  } else {
    ClassList.add(element, clazz);
  }
};

const cleanClass = function (element: Element<DomElement>) {
  const classList = ClassList.supports(element) ? element.dom().classList : ClassList.get(element);
  // classList is a "live list", so this is up to date already
  if (classList.length === 0) {
    // No more classes left, remove the class attribute as well
    Attr.remove(element, 'class');
  }
};

const remove = function (element: Element<DomElement>, clazz: string) {
  if (ClassList.supports(element)) {
    const classList = element.dom().classList;
    classList.remove(clazz);
  } else {
    ClassList.remove(element, clazz);
  }

  cleanClass(element);
};

const toggle = function (element: Element<DomElement>, clazz: string) {
  return ClassList.supports(element) ? element.dom().classList.toggle(clazz) :
    ClassList.toggle(element, clazz);
};

const toggler = function (element: Element<DomElement>, clazz: string) {
  const hasClasslist = ClassList.supports(element);
  const classList = element.dom().classList;
  const off = function () {
    if (hasClasslist) {
      classList.remove(clazz);
    } else {
      ClassList.remove(element, clazz);
    }
  };
  const on = function () {
    if (hasClasslist) {
      classList.add(clazz);
    } else {
      ClassList.add(element, clazz);
    }
  };
  return Toggler(off, on, has(element, clazz));
};

const has = function (element: Element<Node>, clazz: string) {
  // Cereal has a nasty habit of calling this with a text node >.<
  return ClassList.supports(element) && element.dom().classList.contains(clazz);
};

export {
  add,
  remove,
  toggle,
  toggler,
  has,
};