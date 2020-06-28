import { Document as DomDocument, HTMLLinkElement, Node as DomNode } from '@ephox/dom-globals';
import Element from '../node/Element';
import * as Attr from '../properties/Attr';
import * as Insert from './Insert';
import * as Head from '../node/Head';
import * as Document from '../node/Document';

const addToHead = (doc: Element<DomDocument>, tag: Element<DomNode>): void => {
  /*
   * IE9 and above per
   * https://developer.mozilla.org/en-US/docs/Web/API/Document/head
   */
  const head = Head.getHead(doc);
  Insert.append(head, tag);
};

const addStylesheet = (url: string, doc: Element<DomDocument> = Document.getDocument()): Element<HTMLLinkElement> => {

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
