import { Type } from '@ephox/katamari';

// some elements, such as mathml, don't have style attributes
// others, such as angular elements, have style attributes that aren't a CSSStyleDeclaration
const isSupported = (dom: Node): dom is HTMLStyleElement =>
  // eslint-disable-next-line @typescript-eslint/unbound-method
  (dom as HTMLStyleElement).style !== undefined && Type.isFunction((dom as HTMLStyleElement).style.getPropertyValue);

export { isSupported };
