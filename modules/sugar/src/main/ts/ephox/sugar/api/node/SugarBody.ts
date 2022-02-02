import { Fun } from '@ephox/katamari';

import { SugarElement } from './SugarElement';
import * as SugarNode from './SugarNode';
import { getShadowHost, getShadowRoot } from './SugarShadowDom';

// Node.contains() is very, very, very good performance
// http://jsperf.com/closest-vs-contains/5
const inBody = (element: SugarElement<Node>): boolean => {
  // Technically this is only required on IE, where contains() returns false for text nodes.
  // But it's cheap enough to run everywhere and Sugar doesn't have platform detection (yet).
  const dom = SugarNode.isText(element) ? element.dom.parentNode : element.dom;

  // use ownerDocument.body to ensure this works inside iframes.
  // Normally contains is bad because an element "contains" itself, but here we want that.
  if (dom === undefined || dom === null || dom.ownerDocument === null) {
    return false;
  }

  const doc = dom.ownerDocument;
  return getShadowRoot(SugarElement.fromDom(dom)).fold(
    () => doc.body.contains(dom),
    Fun.compose1(inBody, getShadowHost)
  );
};

const body = (): SugarElement<HTMLElement> =>
  getBody(SugarElement.fromDom(document));

const getBody = (doc: SugarElement<Document>): SugarElement<HTMLElement> => {
  const b = doc.dom.body;
  if (b === null || b === undefined) {
    throw new Error('Body is not available yet');
  }
  return SugarElement.fromDom(b);
};

export {
  body,
  getBody,
  inBody
};
