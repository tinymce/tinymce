import * as Dom from '../dom/Dom';
import Element from '../node/Element';
import { Position } from './Position';
import { Element as DomElement, HTMLElement, Node } from '@ephox/dom-globals';

const boxPosition = function (dom: DomElement) {
  const box = dom.getBoundingClientRect();
  return Position(box.left, box.top);
};

// Avoids falsy false fallthrough
const firstDefinedOrZero = function (a: number, b: number) {
  return a !== undefined ? a :
         b !== undefined ? b :
         0;
};

const absolute = function (element: Element) {
  const doc = (element.dom() as Node).ownerDocument;
  const body = doc.body;
  const win = Dom.windowOf(Element.fromDom(doc));
  const html = doc.documentElement;

  const scrollTop = firstDefinedOrZero(win.pageYOffset, html.scrollTop);
  const scrollLeft = firstDefinedOrZero(win.pageXOffset, html.scrollLeft);

  const clientTop = firstDefinedOrZero(html.clientTop, body.clientTop);
  const clientLeft = firstDefinedOrZero(html.clientLeft, body.clientLeft);

  return viewport(element).translate(
    scrollLeft - clientLeft,
    scrollTop - clientTop);
};

// This is the old $.position(), but JQuery does nonsense calculations.
// We're only 1 <-> 1 with the old value in the single place we use this function
// (ego.api.Dragging) so the rest can bite me.
const relative = function (element: Element) {
  const dom: HTMLElement = element.dom();
  // jquery-ism: when style="position: fixed", this === boxPosition()
  // but tests reveal it returns the same thing anyway
  return Position(dom.offsetLeft, dom.offsetTop);
};

const viewport = function (element: Element) {
  const dom = element.dom();

  const doc = dom.ownerDocument;
  const body = doc.body;
  const html = Element.fromDom(doc.documentElement);

  if (body === dom) {
    return Position(body.offsetLeft, body.offsetTop);
  }

  if (!Dom.attached(element, html)) {
    return Position(0, 0);
  }

  return boxPosition(dom);
};

export {
  absolute,
  relative,
  viewport,
};