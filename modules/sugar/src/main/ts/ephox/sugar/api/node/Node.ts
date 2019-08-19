import * as NodeTypes from './NodeTypes';
import { Node as DomNode, Document, Text, Element as DomElement, Comment, HTMLElement as DomHTMLElement, HTMLElementTagNameMap } from '@ephox/dom-globals';
import Element from './Element';
import { HTMLElement } from '@ephox/sand';

const name = function (element: Element<DomNode>) {
  const r = element.dom().nodeName;
  return r.toLowerCase();
};

const type = function (element: Element<DomNode>) {
  return element.dom().nodeType;
};

const value = function (element: Element<DomNode>) {
  return element.dom().nodeValue;
};

const isType = function <E> (t: number) {
  return function (element: Element): element is Element<E> {
    return type(element) === t;
  };
};

const isComment = function (element: Element): element is Element<Comment> {
  return type(element) === NodeTypes.COMMENT || name(element) === '#comment';
};

const isHTMLElement = function (element: Element<any>): element is Element<DomHTMLElement> {
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
  isTag,
};