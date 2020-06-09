import Element from './Element';
import { Document, HTMLHeadElement } from '@ephox/dom-globals';

export const getHead = (doc: Element<Document>): Element<HTMLHeadElement> => {
  const b = doc.dom().head;
  if (b === null || b === undefined) {
    throw new Error('Head is not available yet');
  }
  return Element.fromDom(b);
};
