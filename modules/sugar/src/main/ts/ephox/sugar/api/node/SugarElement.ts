import { Fun, Option } from '@ephox/katamari';

interface SugarElement<T = any> {
  dom: () => T;
}

const fromHtml = <E extends Node = Node & ChildNode> (html: string, scope?: Document | null): SugarElement<E> => {
  const doc = scope || document;
  const div = doc.createElement('div');
  div.innerHTML = html;
  if (!div.hasChildNodes() || div.childNodes.length > 1) {
    // eslint-disable-next-line no-console
    console.error('HTML does not have a single root node', html);
    throw new Error('HTML must have a single root node');
  }
  return fromDom(div.childNodes[0] as unknown as E);
};

const fromTag: {
  <K extends keyof HTMLElementTagNameMap>(tag: K, scope?: Document | null): SugarElement<HTMLElementTagNameMap[K]>;
  (tag: string, scope?: Document | null): SugarElement<HTMLElement>;
} = (tag: string, scope?: Document | null): SugarElement => {
  const doc = scope || document;
  const node = doc.createElement(tag);
  return fromDom(node);
};

const fromText = (text: string, scope?: Document | null): SugarElement<Text> => {
  const doc = scope || document;
  const node = doc.createTextNode(text);
  return fromDom(node);
};

const fromDom = <T extends Node | Window> (node: T | null): SugarElement<T> => {
  if (node === null || node === undefined) { throw new Error('Node cannot be null or undefined'); }
  return {
    dom: Fun.constant(node)
  };
};

const fromPoint = (docElm: SugarElement<Document>, x: number, y: number): Option<SugarElement<Element>> => {
  const doc = docElm.dom();
  return Option.from(doc.elementFromPoint(x, y)).map(fromDom);
};

// tslint:disable-next-line:variable-name
const SugarElement = {
  fromHtml,
  fromTag,
  fromText,
  fromDom,
  fromPoint
};

export {
  SugarElement
};
