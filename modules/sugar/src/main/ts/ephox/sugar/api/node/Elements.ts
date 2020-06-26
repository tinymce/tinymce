import { document, Document, Node, Window } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import * as Traverse from '../search/Traverse';
import Element from './Element';

type ElementTuple<T> = { [K in keyof T]: Element<T[K]> };

const fromHtml = <T extends Node[]> (html: string, scope?: Document | null): ElementTuple<T> => {
  const doc: Document = scope || document;
  const div = doc.createElement('div');
  div.innerHTML = html;
  return Traverse.children(Element.fromDom(div)) as unknown as ElementTuple<T>;
};

const fromTags = (tags: string[], scope?: Document | null) => Arr.map(tags, (x) => Element.fromTag(x, scope));

const fromText = (texts: string[], scope?: Document | null) => Arr.map(texts, (x) => Element.fromText(x, scope));

const fromDom = <T extends (Node | Window)>(nodes: ArrayLike<T>): Element<T>[] => Arr.map(nodes, Element.fromDom);

export { fromHtml, fromTags, fromText, fromDom };
