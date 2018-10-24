import { Fun } from '@ephox/katamari';
import Toggler from '../properties/Toggler';
import * as Css from '../properties/Css';
import { HTMLElement } from '@ephox/dom-globals';
import Element from '../node/Element';

// This function is dangerous. Toggle behaviour is different depending on whether the element is in the DOM or not when it's created.
var visibilityToggler = function (element: Element, property: string, hiddenValue: string, visibleValue: string) {
  var initial = Css.get(element, property);
  // old jquery-ism that this function depends on
  if (initial === undefined) initial = '';

  var value = initial === hiddenValue ? visibleValue : hiddenValue;

  var off = Fun.curry(Css.set, element, property, initial);
  var on = Fun.curry(Css.set, element, property, value);
  return Toggler(off, on, false);
};

var toggler = function (element: Element) {
  return visibilityToggler(element, 'visibility', 'hidden', 'visible');
};

var displayToggler = function (element: Element, value: string) {
  return visibilityToggler(element, 'display', 'none', value);
};

var isHidden = function (dom: HTMLElement) {
  return dom.offsetWidth <= 0 && dom.offsetHeight <= 0;
};

var isVisible = function (element: Element) {
  var dom = element.dom();
  return !isHidden(dom);
};

export {
  toggler,
  displayToggler,
  isVisible,
};