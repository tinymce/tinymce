import { document, Document, Node as DomNode } from '@ephox/dom-globals';
import Element from '../node/Element';
import * as Attr from '../properties/Attr';
import * as Insert from './Insert';

const addToHead = (doc: Element<Document>, tag: Element<DomNode>) => {
  /*
   * IE9 and above per
   * https://developer.mozilla.org/en-US/docs/Web/API/Document/head
   */
  const head = Element.fromDom(doc.dom().head);
  Insert.append(head, tag);
};

const addStylesheet = (url: string, scope?: Element<Document>) => {
  const doc = scope || Element.fromDom(document);

  const link = Element.fromTag('link', doc.dom()); // We really need to fix that Element API

  Attr.setAll(link, {
    rel: 'stylesheet',
    type: 'text/css',
    href: url
  });

  addToHead(doc, link);
  return link;
};

export {
  addStylesheet
};
