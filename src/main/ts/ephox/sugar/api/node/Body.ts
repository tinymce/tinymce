import { Thunk } from '@ephox/katamari';
import Element from './Element';
import * as Node from './Node';
import { document, Document } from '@ephox/dom-globals';

// Node.contains() is very, very, very good performance
// http://jsperf.com/closest-vs-contains/5
var inBody = function (element: Element) {
  // Technically this is only required on IE, where contains() returns false for text nodes.
  // But it's cheap enough to run everywhere and Sugar doesn't have platform detection (yet).
  var dom = Node.isText(element) ? element.dom().parentNode : element.dom();

  // use ownerDocument.body to ensure this works inside iframes.
  // Normally contains is bad because an element "contains" itself, but here we want that.
  return dom !== undefined && dom !== null && dom.ownerDocument.body.contains(dom);
};

var body = Thunk.cached(function() {
  return getBody(Element.fromDom(document));
});

var getBody = function (doc: Element) {
  var body = (doc.dom() as Document).body;
  if (body === null || body === undefined) throw 'Body is not available yet';
  return Element.fromDom(body);
};

export {
  body,
  getBody,
  inBody,
};