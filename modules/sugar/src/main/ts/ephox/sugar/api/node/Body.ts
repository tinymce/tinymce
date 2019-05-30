import { Thunk } from '@ephox/katamari';
import Element from './Element';
import * as Node from './Node';
import { document, Document } from '@ephox/dom-globals';

// Node.contains() is very, very, very good performance
// http://jsperf.com/closest-vs-contains/5
const inBody = function (element: Element) {
  // Technically this is only required on IE, where contains() returns false for text nodes.
  // But it's cheap enough to run everywhere and Sugar doesn't have platform detection (yet).
  const dom = Node.isText(element) ? element.dom().parentNode : element.dom();

  // use ownerDocument.body to ensure this works inside iframes.
  // Normally contains is bad because an element "contains" itself, but here we want that.
  return dom !== undefined && dom !== null && dom.ownerDocument.body.contains(dom);
};

const body = Thunk.cached(function () {
  return getBody(Element.fromDom(document));
});

const getBody = function (doc: Element) {
  const b = (doc.dom() as Document).body;
  if (b === null || b === undefined) { throw new Error('Body is not available yet'); }
  return Element.fromDom(b);
};

export {
  body,
  getBody,
  inBody,
};