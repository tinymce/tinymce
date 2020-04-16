import { Element as DomElement, HTMLElement } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import Element from '../node/Element';
import * as Css from '../properties/Css';
import Toggler from '../properties/Toggler';

// This function is dangerous. Toggle behaviour is different depending on whether the element is in the DOM or not when it's created.
const visibilityToggler = (element: Element<DomElement>, property: string, hiddenValue: string, visibleValue: string) => {
  let initial = Css.get(element, property);
  // old jquery-ism that this function depends on
  if (initial === undefined) {
    initial = '';
  }

  const value = initial === hiddenValue ? visibleValue : hiddenValue;

  const off = Fun.curry(Css.set, element, property, initial);
  const on = Fun.curry(Css.set, element, property, value);
  return Toggler(off, on, false);
};

const toggler = (element: Element<DomElement>) => visibilityToggler(element, 'visibility', 'hidden', 'visible');

const displayToggler = (element: Element<DomElement>, value: string) => visibilityToggler(element, 'display', 'none', value);

const isHidden = (dom: HTMLElement): boolean => dom.offsetWidth <= 0 && dom.offsetHeight <= 0;

const isVisible = (element: Element<HTMLElement>): boolean => !isHidden(element.dom());

export {
  toggler,
  displayToggler,
  isVisible
};
