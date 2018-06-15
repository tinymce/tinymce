import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { document, console, Node, Window, Document } from '@ephox/dom-globals';

interface Element {
  dom: () => any;
}

const fromHtml = function (html: string, scope?: Document): Element {
  const doc = scope || document;
  const div = doc.createElement('div');
  div.innerHTML = html;
  if (!div.hasChildNodes() || div.childNodes.length > 1) {
    console.error('HTML does not have a single root node', html);
    throw 'HTML must have a single root node';
  }
  return fromDom(div.childNodes[0]);
};

const fromTag = function (tag: string, scope?: Document): Element {
  const doc = scope || document;
  const node = doc.createElement(tag);
  return fromDom(node);
};

const fromText = function (text: string, scope?: Document): Element {
  const doc = scope || document;
  const node = doc.createTextNode(text);
  return fromDom(node);
};

const fromDom = function (node: Node | Window): Element {
  if (node === null || node === undefined) throw new Error('Node cannot be null or undefined');
  return {
    dom: Fun.constant(node)
  };
};

const fromPoint = function (docElm: Element, x, y): Option<Element> {
  const doc = docElm.dom() as Document;
  return Option.from(doc.elementFromPoint(x, y)).map(fromDom);
};

const Element = {
  fromHtml,
  fromTag,
  fromText,
  fromDom,
  fromPoint
};

export default Element;