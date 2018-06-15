import Toggler from './Toggler';
import Attr from './Attr';
import ClassList from '../../impl/ClassList';
import Element from '../node/Element';
import { Element as DomElement } from '@ephox/dom-globals';

/*
 * ClassList is IE10 minimum:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
 *
 * Note that IE doesn't support the second argument to toggle (at all).
 * If it did, the toggler could be better.
 */

var add = function (element: Element, clazz: string) {
  if (ClassList.supports(element)) element.dom().classList.add(clazz);
  else ClassList.add(element, clazz);
};

var cleanClass = function (element: Element) {
  var classList = ClassList.supports(element) ? element.dom().classList : ClassList.get(element);
  // classList is a "live list", so this is up to date already
  if (classList.length === 0) {
    // No more classes left, remove the class attribute as well
    Attr.remove(element, 'class');
  }
};

var remove = function (element: Element, clazz: string) {
  if (ClassList.supports(element)) {
    var classList = element.dom().classList;
    classList.remove(clazz);
  } else
    ClassList.remove(element, clazz);

  cleanClass(element);
};

var toggle = function (element: Element, clazz: string) {
  return ClassList.supports(element) ? (element.dom() as DomElement).classList.toggle(clazz) :
                                       ClassList.toggle(element, clazz);
};

var toggler = function (element: Element, clazz: string) {
  var hasClasslist = ClassList.supports(element);
  var classList = element.dom().classList;
  var off = function () {
    if (hasClasslist) classList.remove(clazz);
    else ClassList.remove(element, clazz);
  };
  var on = function () {
    if (hasClasslist) classList.add(clazz);
    else ClassList.add(element, clazz);
  };
  return Toggler(off, on, has(element, clazz));
};

var has = function (element: Element, clazz: string) {
  // Cereal has a nasty habit of calling this with a text node >.<
  return ClassList.supports(element) && (element.dom() as DomElement).classList.contains(clazz);
};

export default {
  add,
  remove,
  toggle,
  toggler,
  has,
};