import * as Dom from '../dom/Dom';
import Element from '../node/Element';
import { Position } from './Position';
import { Element as DomElement, HTMLElement, Node } from '@ephox/dom-globals';

var boxPosition = function (dom: DomElement) {
  var box = dom.getBoundingClientRect();
  return Position(box.left, box.top);
};

// Avoids falsy false fallthrough
var firstDefinedOrZero = function (a: number, b: number) {
  return a !== undefined ? a :
         b !== undefined ? b :
         0;
};

var absolute = function (element: Element) {
  var doc = (element.dom() as Node).ownerDocument;
  var body = doc.body;
  var win = Dom.windowOf(Element.fromDom(doc));
  var html = doc.documentElement;

  var scrollTop = firstDefinedOrZero(win.pageYOffset, html.scrollTop);
  var scrollLeft = firstDefinedOrZero(win.pageXOffset, html.scrollLeft);

  var clientTop = firstDefinedOrZero(html.clientTop, body.clientTop);
  var clientLeft = firstDefinedOrZero(html.clientLeft, body.clientLeft);

  return viewport(element).translate(
    scrollLeft - clientLeft,
    scrollTop - clientTop);
};

// This is the old $.position(), but JQuery does nonsense calculations.
// We're only 1 <-> 1 with the old value in the single place we use this function
// (ego.api.Dragging) so the rest can bite me.
var relative = function (element: Element) {
  var dom: HTMLElement = element.dom();
  // jquery-ism: when style="position: fixed", this === boxPosition()
  // but tests reveal it returns the same thing anyway
  return Position(dom.offsetLeft, dom.offsetTop);
};

var viewport = function (element: Element) {
  var dom = element.dom();

  var doc = dom.ownerDocument;
  var body = doc.body;
  var html = Element.fromDom(doc.documentElement);

  if (body === dom)
    return Position(body.offsetLeft, body.offsetTop);

  if (!Dom.attached(element, html))
    return Position(0, 0);

  return boxPosition(dom);
};

export {
  absolute,
  relative,
  viewport,
};