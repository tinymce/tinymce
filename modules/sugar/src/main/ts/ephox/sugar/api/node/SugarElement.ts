import { Optional } from '@ephox/katamari';

import { HTMLElementFullTagNameMap } from '../../alien/DomTypes';

interface SugarElement<T = any> {
  readonly dom: T;
}

const fromHtml = <E extends Node = Node & ChildNode> (html: string, scope?: Document | null): SugarElement<E> => {
  const doc = scope || document;
  const div = doc.createElement('div');
  div.innerHTML = html;
  if (!div.hasChildNodes() || div.childNodes.length > 1) {
    const message = 'HTML does not have a single root node';
    // eslint-disable-next-line no-console
    console.error(message, html);
    throw new Error(message);
  }
  return fromDom(div.childNodes[0] as unknown as E);
};

const fromTag: {
  <K extends keyof HTMLElementFullTagNameMap>(tag: K, scope?: Document | null): SugarElement<HTMLElementFullTagNameMap[K]>;
  (tag: string, scope?: Document | null): SugarElement<HTMLElement>;
} = (tag: string, scope?: Document | null): SugarElement<HTMLElement> => {
  const doc = scope || document;
  const node = doc.createElement(tag);
  return fromDom(node);
};

const fromText = (text: string, scope?: Document | null): SugarElement<Text> => {
  const doc = scope || document;
  const node = doc.createTextNode(text);
  return fromDom(node);
};

const fromDom = <T extends Node | Window> (node: T): SugarElement<T> => {
  // TODO: Consider removing this check, but left atm for safety
  if (node === null || node === undefined) {
    throw new Error('Node cannot be null or undefined');
  }
  return {
    dom: node
  };
};

const fromPoint = (docElm: SugarElement<Document>, x: number, y: number): Optional<SugarElement<Element>> =>
  Optional.from(docElm.dom.elementFromPoint(x, y)).map(fromDom);

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
