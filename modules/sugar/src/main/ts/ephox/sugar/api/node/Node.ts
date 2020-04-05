import { Comment, Document, Element as DomElement, HTMLElement as DomHTMLElement, HTMLElementTagNameMap, Node as DomNode, Text } from '@ephox/dom-globals';
import { HTMLElement } from '@ephox/sand';
import Element from './Element';
import * as NodeTypes from './NodeTypes';

const name = (element: Element<DomNode>) => {
  const r = element.dom().nodeName;
  return r.toLowerCase();
};

const type = (element: Element<DomNode>) => {
  return element.dom().nodeType;
};

const value = (element: Element<DomNode>) => {
  return element.dom().nodeValue;
};

const isType = <E> (t: number) => {
  return (element: Element): element is Element<E> => {
    return type(element) === t;
  };
};

const isComment = (element: Element): element is Element<Comment> => {
  return type(element) === NodeTypes.COMMENT || name(element) === '#comment';
};

const isHTMLElement = (element: Element<any>): element is Element<DomHTMLElement> => {
  return HTMLElement.isPrototypeOf(element.dom());
};

const isElement = isType<DomElement>(NodeTypes.ELEMENT);
const isText = isType<Text>(NodeTypes.TEXT);
const isDocument = isType<Document>(NodeTypes.DOCUMENT);

const isTag = <K extends keyof HTMLElementTagNameMap>(tag: K) => (e: Element<any>): e is Element<HTMLElementTagNameMap[K]> => {
  return isElement(e) && name(e) === tag;
};

export {
  name,
  type,
  value,
  isElement,
  isHTMLElement,
  isText,
  isDocument,
  isComment,
  isTag
};
