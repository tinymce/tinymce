import { SandHTMLElement } from '@ephox/sand';

import { HTMLElementFullTagNameMap } from '../../alien/DomTypes';
import * as NodeTypes from './NodeTypes';
import { SugarElement } from './SugarElement';

const name = (element: SugarElement<Node>): string => {
  const r = element.dom.nodeName;
  return r.toLowerCase();
};

const type = (element: SugarElement<Node>): number =>
  element.dom.nodeType;

const value = (element: SugarElement<Node>): string | null =>
  element.dom.nodeValue;

const isType = <E extends Node> (t: number) => (element: SugarElement<Node>): element is SugarElement<E> =>
  type(element) === t;

const isComment = (element: SugarElement<Node>): element is SugarElement<Comment> =>
  type(element) === NodeTypes.COMMENT || name(element) === '#comment';

const isHTMLElement = (element: SugarElement<Node>): element is SugarElement<HTMLElement> =>
  isElement(element) && SandHTMLElement.isPrototypeOf(element.dom);

const isElement = isType<Element>(NodeTypes.ELEMENT);
const isText = isType<Text>(NodeTypes.TEXT);
const isDocument = isType<Document>(NodeTypes.DOCUMENT);
const isDocumentFragment = isType<DocumentFragment>(NodeTypes.DOCUMENT_FRAGMENT);

const isTag = <K extends keyof HTMLElementFullTagNameMap>(tag: K) => (e: SugarElement<Node>): e is SugarElement<HTMLElementFullTagNameMap[K]> =>
  isElement(e) && name(e) === tag;

export {
  name,
  type,
  value,
  isElement,
  isHTMLElement,
  isText,
  isDocument,
  isDocumentFragment,
  isComment,
  isTag
};
