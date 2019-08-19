import { console, document, Document, Node as DomNode, Window, HTMLElement, Text, Element as DomElement, HTMLElementTagNameMap, ChildNode } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';

interface Element<T = any> {
  dom: () => T;
}

const fromHtml = function <E extends DomNode = DomNode & ChildNode> (html: string, scope?: Document): Element<E> {
  const doc = scope || document;
  const div = doc.createElement('div');
  div.innerHTML = html;
  if (!div.hasChildNodes() || div.childNodes.length > 1) {
    // tslint:disable-next-line:no-console
    console.error('HTML does not have a single root node', html);
    throw new Error('HTML must have a single root node');
  }
  return fromDom(div.childNodes[0] as unknown as E);
};

const fromTag: {
  <K extends keyof HTMLElementTagNameMap>(tag: K, scope?: Document): Element<HTMLElementTagNameMap[K]>;
  (tag: string, scope?: Document): Element<HTMLElement>;
} = function (tag: string, scope?: Document): Element {
  const doc = scope || document;
  const node = doc.createElement(tag);
  return fromDom(node);
};

const fromText = function (text: string, scope?: Document): Element<Text> {
  const doc = scope || document;
  const node = doc.createTextNode(text);
  return fromDom(node);
};

const fromDom = function <T extends DomNode | Window> (node: T): Element<T> {
  if (node === null || node === undefined) { throw new Error('Node cannot be null or undefined'); }
  return {
    dom: Fun.constant(node)
  };
};

const fromPoint = function (docElm: Element, x: number, y: number): Option<Element<DomElement>> {
  const doc = docElm.dom() as Document;
  return Option.from(doc.elementFromPoint(x, y)).map(fromDom);
};

// tslint:disable-next-line:variable-name
const Element = {
  fromHtml,
  fromTag,
  fromText,
  fromDom,
  fromPoint
};

export default Element;