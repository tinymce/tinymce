import NodeTypes from './NodeTypes';
import { Node } from '@ephox/dom-globals';
import Element from './Element';

var name = function (element: Element) {
  var r = (element.dom() as Node).nodeName;
  return r.toLowerCase();
};

var type = function (element: Element) {
  return (element.dom() as Node).nodeType;
};

var value = function (element: Element) {
  return (element.dom() as Node).nodeValue;
};

var isType = function (t: number) {
  return function (element: Element) {
    return type(element) === t;
  };
};

var isComment = function (element: Element) {
  return type(element) === NodeTypes.COMMENT || name(element) === '#comment';
};

var isElement = isType(NodeTypes.ELEMENT);
var isText = isType(NodeTypes.TEXT);
var isDocument = isType(NodeTypes.DOCUMENT);

export default {
  name,
  type,
  value,
  isElement,
  isText,
  isDocument,
  isComment,
};