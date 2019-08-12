import { document, Document, Node, Window, HTMLElementTagNameMap, HTMLElement, HTMLSpanElement, HTMLDivElement, HTMLTableElement } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import * as Traverse from '../search/Traverse';
import Element from './Element';

type ElementTuple<T> = { [K in keyof T]: Element<T[K]> };

const fromHtml = function <T extends Node[]>(html: string, scope?: Document): ElementTuple<T> {
  const doc: Document = scope || document;
  const div = doc.createElement('div');
  div.innerHTML = html;
  return Traverse.children(Element.fromDom(div)) as unknown as ElementTuple<T>;
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
