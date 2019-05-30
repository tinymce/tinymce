import * as NodeTypes from './NodeTypes';
import { Node } from '@ephox/dom-globals';
import Element from './Element';

const name = function (element: Element) {
  const r = (element.dom() as Node).nodeName;
  return r.toLowerCase();
};

const type = function (element: Element) {
  return (element.dom() as Node).nodeType;
};

const value = function (element: Element) {
  return (element.dom() as Node).nodeValue;
};

const isType = function (t: number) {
  return function (element: Element) {
    return type(element) === t;
  };
};

const isComment = function (element: Element) {
  return type(element) === NodeTypes.COMMENT || name(element) === '#comment';
};

const isElement = isType(NodeTypes.ELEMENT);
const isText = isType(NodeTypes.TEXT);
const isDocument = isType(NodeTypes.DOCUMENT);

export {
  name,
  type,
  value,
  isElement,
  isText,
  isDocument,
  isComment,
};