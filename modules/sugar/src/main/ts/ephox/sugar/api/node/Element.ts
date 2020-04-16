import { ChildNode, console, document, Document, Element as DomElement, HTMLElement, HTMLElementTagNameMap, Node as DomNode, Text, Window } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';

interface Element<T = any> {
  dom: () => T;
}

const fromHtml = <E extends DomNode = DomNode & ChildNode> (html: string, scope?: Document | null): Element<E> => {
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
  <K extends keyof HTMLElementTagNameMap>(tag: K, scope?: Document | null): Element<HTMLElementTagNameMap[K]>;
  (tag: string, scope?: Document | null): Element<HTMLElement>;
} = (tag: string, scope?: Document | null): Element => {
  const doc = scope || document;
  const node = doc.createElement(tag);
  return fromDom(node);
};

const fromText = (text: string, scope?: Document | null): Element<Text> => {
  const doc = scope || document;
  const node = doc.createTextNode(text);
  return fromDom(node);
};

const fromDom = <T extends DomNode | Window> (node: T | null): Element<T> => {
  if (node === null || node === undefined) { throw new Error('Node cannot be null or undefined'); }
  return {
    dom: Fun.constant(node)
  };
};

const fromPoint = (docElm: Element<Document>, x: number, y: number): Option<Element<DomElement>> => {
  const doc = docElm.dom();
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
