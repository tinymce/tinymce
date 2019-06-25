import { HTMLElement, CSSStyleDeclaration } from '@ephox/dom-globals';
import { Type } from '@ephox/katamari';

// some elements, such as mathml, don't have style attributes
// others, such as angular elements, have style attributes that aren't a CSSStyleDeclaration
const isSupported = (dom: HTMLElement) => dom.style !== undefined && Type.isFunction(dom.style.getPropertyValue);

export {
  isSupported
};