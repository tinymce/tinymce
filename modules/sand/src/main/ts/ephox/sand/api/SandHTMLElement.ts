import { Resolve, Type } from '@ephox/katamari';

import * as Global from '../util/Global';

const getPrototypeOf = Object.getPrototypeOf;

/*
 * IE9 and above
 *
 * MDN no use on this one, but here's the link anyway:
 * https://developer.mozilla.org/en/docs/Web/API/HTMLElement
 */
const sandHTMLElement = (scope: Window | undefined) => {
  return Global.getOrDie('HTMLElement', scope) as typeof HTMLElement;
};

const isPrototypeOf = (x: any): x is HTMLElement => {
  // use Resolve to get the window object for x and just return undefined if it can't find it.
  // undefined scope later triggers using the global window.
  const scope: Window | undefined = Resolve.resolve('ownerDocument.defaultView', x);

  // TINY-7374: We can't rely on looking at the owner window HTMLElement as the element may have
  // been constructed in a different window and then appended to the current window document.
  return Type.isObject(x) && (sandHTMLElement(scope).prototype.isPrototypeOf(x) || /^HTML\w*Element$/.test(getPrototypeOf(x).constructor.name));
};

export {
  isPrototypeOf
};
