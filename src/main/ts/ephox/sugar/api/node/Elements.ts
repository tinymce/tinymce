import { Arr } from '@ephox/katamari';
import Element from './Element';
import * as Traverse from '../search/Traverse';
import { document, Document, Window } from '@ephox/dom-globals';
import { Node } from '@ephox/dom-globals';

var fromHtml = function (html: string, scope?: Document) {
  var doc: Document = scope || document;
  var div = doc.createElement('div');
  div.innerHTML = html;
  return Traverse.children(Element.fromDom(div));
};

var fromTags = function (tags: string[], scope?: Document) {
  return Arr.map(tags, function (x) {
    return Element.fromTag(x, scope);
  });
};

var fromText = function (texts: string[], scope?: Document) {
  return Arr.map(texts, function (x) {
    return Element.fromText(x, scope);
  });
};

var fromDom = function (nodes: (Node | Window)[]) {
  return Arr.map(nodes, Element.fromDom);
};

export {
  fromHtml,
  fromTags,
  fromText,
  fromDom,
};