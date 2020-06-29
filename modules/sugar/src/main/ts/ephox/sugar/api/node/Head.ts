import { document, Document, HTMLHeadElement } from '@ephox/dom-globals';
import Element from './Element';

export const head = (): Element<HTMLHeadElement> => getHead(Element.fromDom(document));

export const getHead = (doc: Element<Document>): Element<HTMLHeadElement> => {
  const b = doc.dom().head;
  if (b === null || b === undefined) {
    throw new Error('Head is not available yet');
  }
  return Element.fromDom(b);
};
