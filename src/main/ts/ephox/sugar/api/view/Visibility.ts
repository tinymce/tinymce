import { Fun } from '@ephox/katamari';
import Toggler from '../properties/Toggler';
import * as Css from '../properties/Css';
import { HTMLElement } from '@ephox/dom-globals';
import Element from '../node/Element';

// This function is dangerous. Toggle behaviour is different depending on whether the element is in the DOM or not when it's created.
const visibilityToggler = function (element: Element, property: string, hiddenValue: string, visibleValue: string) {
  let initial = Css.get(element, property);
  // old jquery-ism that this function depends on
  if (initial === undefined) { initial = ''; }

  const value = initial === hiddenValue ? visibleValue : hiddenValue;

  const off = Fun.curry(Css.set, element, property, initial);
  const on = Fun.curry(Css.set, element, property, value);
  return Toggler(off, on, false);
};

const toggler = function (element: Element) {
  return visibilityToggler(element, 'visibility', 'hidden', 'visible');
};

const displayToggler = function (element: Element, value: string) {
  return visibilityToggler(element, 'display', 'none', value);
};

const isHidden = function (dom: HTMLElement) {
  return dom.offsetWidth <= 0 && dom.offsetHeight <= 0;
};

const isVisible = function (element: Element) {
  const dom = element.dom();
  return !isHidden(dom);
};

export {
  toggler,
  displayToggler,
  isVisible,
};