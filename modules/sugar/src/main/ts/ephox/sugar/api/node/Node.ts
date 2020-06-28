import {
  Comment,
  Document,
  DocumentFragment,
  Element as DomElement,
  HTMLElement as DomHTMLElement,
  HTMLElementTagNameMap,
  Node as DomNode,
  Text
} from '@ephox/dom-globals';
import { HTMLElement } from '@ephox/sand';
import Element from './Element';
import * as NodeTypes from './NodeTypes';

const name = (element: Element<DomNode>): string => {
  const r = element.dom().nodeName;
  return r.toLowerCase();
};

const type = (element: Element<DomNode>): number =>
  element.dom().nodeType;

const value = (element: Element<DomNode>): string | null =>
  element.dom().nodeValue;

const isType = <E extends DomNode> (t: number) => (element: Element<DomNode>): element is Element<E> =>
  type(element) === t;

const isComment = (element: Element): element is Element<Comment> =>
  type(element) === NodeTypes.COMMENT || name(element) === '#comment';

const isHTMLElement = (element: Element<any>): element is Element<DomHTMLElement> =>
  HTMLElement.isPrototypeOf(element.dom());

const isElement: (element: Element<DomNode>) => element is Element<DomElement> =
  isType<DomElement>(NodeTypes.ELEMENT);

const isText: (element: Element<DomNode>) =>
  element is Element<Text> = isType<Text>(NodeTypes.TEXT);

const isDocument: (element: Element<DomNode>) => element is Element<Document> =
  isType<Document>(NodeTypes.DOCUMENT);

const isDocumentFragment: (element: Element<DomNode>) => element is Element<DocumentFragment> =
  isType<DocumentFragment>(NodeTypes.DOCUMENT_FRAGMENT);

const isTag = <K extends keyof HTMLElementTagNameMap>(tag: K) => (e: Element<DomNode>): e is Element<HTMLElementTagNameMap[K]> =>
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
