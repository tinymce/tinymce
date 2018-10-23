import * as Attr from '../properties/Attr';
import Element from '../node/Element';
import * as Insert from './Insert';
import { document } from '@ephox/dom-globals';

var addToHead = function (doc: Element, tag: Element) {
  /*
   * IE9 and above per
   * https://developer.mozilla.org/en-US/docs/Web/API/Document/head
   */
  var head = Element.fromDom(doc.dom().head);
  Insert.append(head, tag);
};

var addStylesheet = function (url: string, scope?: Element) {
  var doc = scope || Element.fromDom(document);

  var link = Element.fromTag('link', doc.dom()); // We really need to fix that Element API

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