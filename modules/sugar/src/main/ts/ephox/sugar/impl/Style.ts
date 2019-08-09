import { HTMLStyleElement, Node as DomNode } from '@ephox/dom-globals';
import { Type } from '@ephox/katamari';

// some elements, such as mathml, don't have style attributes
// others, such as angular elements, have style attributes that aren't a CSSStyleDeclaration
const isSupported = (dom: DomNode): dom is HTMLStyleElement =>
  (dom as HTMLStyleElement).style !== undefined && Type.isFunction((dom as HTMLStyleElement).style.getPropertyValue);

export { isSupported };