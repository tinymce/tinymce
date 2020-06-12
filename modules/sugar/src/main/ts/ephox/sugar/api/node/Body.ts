import { document, Document, HTMLElement, Node as DomNode } from '@ephox/dom-globals';
import Element from './Element';
import * as Node from './Node';
import { getShadowHost, getShadowRoot } from './ShadowDom';
import { Fun } from '@ephox/katamari';

// Node.contains() is very, very, very good performance
// http://jsperf.com/closest-vs-contains/5
const inBody = (element: Element<DomNode>): boolean => {
  // Technically this is only required on IE, where contains() returns false for text nodes.
  // But it's cheap enough to run everywhere and Sugar doesn't have platform detection (yet).
  const dom = Node.isText(element) ? element.dom().parentNode : element.dom();

  // use ownerDocument.body to ensure this works inside iframes.
  // Normally contains is bad because an element "contains" itself, but here we want that.
  if (dom === undefined || dom === null || dom.ownerDocument === null) {
    return false;
  }

  return getShadowRoot(Element.fromDom(dom)).fold(
    () => dom.ownerDocument.body.contains(dom),
    Fun.compose1(inBody, getShadowHost)
  );
};

const body = () => getBody(Element.fromDom(document));

const getBody = (doc: Element<Document>): Element<HTMLElement> => {
  const b = doc.dom().body;
  if (b === null || b === undefined) {
    throw new Error('Body is not available yet');
  }
  return Element.fromDom(b);
};

export {
  body,
  getBody,
  inBody
};
