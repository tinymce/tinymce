import * as Attr from '../properties/Attr';
import Element from '../node/Element';
import * as Insert from './Insert';
import { document } from '@ephox/dom-globals';

const addToHead = function (doc: Element, tag: Element) {
  /*
   * IE9 and above per
   * https://developer.mozilla.org/en-US/docs/Web/API/Document/head
   */
  const head = Element.fromDom(doc.dom().head);
  Insert.append(head, tag);
};

const addStylesheet = function (url: string, scope?: Element) {
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