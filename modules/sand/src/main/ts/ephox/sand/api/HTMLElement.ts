import { Resolve } from '@ephox/katamari';
import * as Global from '../util/Global';
import { Window, HTMLElement } from '@ephox/dom-globals';

/*
 * IE9 and above
 *
 * MDN no use on this one, but here's the link anyway:
 * https://developer.mozilla.org/en/docs/Web/API/HTMLElement
 */
const htmlElement = function (scope: Window) {
  return Global.getOrDie('HTMLElement', scope) as typeof HTMLElement;
};

const isPrototypeOf = function (x: any): x is HTMLElement {
  // use Resolve to get the window object for x and just return undefined if it can't find it.
  // undefined scope later triggers using the global window.
  const scope: Window | undefined = Resolve.resolve('ownerDocument.defaultView', x);

  return htmlElement(scope).prototype.isPrototypeOf(x);
};

export {
  isPrototypeOf
};
