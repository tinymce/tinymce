import { Thunk } from '@ephox/katamari';
import Element from './Element';
import * as Node from './Node';
import { document, Document, Node as DomNode, HTMLElement } from '@ephox/dom-globals';
import * as ShadowDom from '../dom/ShadowDom';
import * as Traverse from '../search/Traverse';

// Node.contains() is very, very, very good performance
// http://jsperf.com/closest-vs-contains/5
const inBody = function (element: Element<DomNode>) {
  // Technically this is only required on IE, where contains() returns false for text nodes.
  // But it's cheap enough to run everywhere and Sugar doesn't have platform detection (yet).
  if (Node.isText(element)) {
    element = Traverse.parent(element).getOr(element);
  }

  // Try to find the first parent node that's not contained within a shadow dom.
  // Otherwise, body.contains() will always return false.
  const dom = ShadowDom.escapeShadowDom(element).dom();

  // use ownerDocument.body to ensure this works inside iframes.
  // Normally contains is bad because an element "contains" itself, but here we want that.
  return dom !== undefined && dom !== null && dom.ownerDocument.body.contains(dom);
};

const body: () => Element<HTMLElement> = Thunk.cached(function () {
  return getBody(Element.fromDom(document));
});

const getBody = function (doc: Element<Document>) {
  const b = doc.dom().body;
  if (b === null || b === undefined) {
    throw new Error('Body is not available yet');
  }
  return Element.fromDom(b);
};

export {
  body,
  getBody,
  inBody,
};
