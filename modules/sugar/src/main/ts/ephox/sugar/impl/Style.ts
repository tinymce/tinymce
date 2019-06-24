import { HTMLElement, CSSStyleDeclaration } from '@ephox/dom-globals';

// some elements, such as mathml, don't have style attributes
// others, such as angular elements, have style attributes that aren't a CSSStyleDeclaration
const isSupported = (dom: HTMLElement) => CSSStyleDeclaration.prototype.isPrototypeOf(dom.style);

export {
  isSupported
};