import { document, Document, Node, Window } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import * as Traverse from '../search/Traverse';
import Element from './Element';

const fromHtml = function (html: string, scope?: Document) {
  const doc: Document = scope || document;
  const div = doc.createElement('div');
  div.innerHTML = html;
  return Traverse.children(Element.fromDom(div));
};

const fromTags = function (tags: string[], scope?: Document) {
  return Arr.map(tags, function (x) {
    return Element.fromTag(x, scope);
  });
};

const fromText = function (texts: string[], scope?: Document) {
  return Arr.map(texts, function (x) {
    return Element.fromText(x, scope);
  });
};

const fromDom = function (nodes: (Node | Window)[]) {
  return Arr.map(nodes, Element.fromDom);
};

export { fromHtml, fromTags, fromText, fromDom, };
