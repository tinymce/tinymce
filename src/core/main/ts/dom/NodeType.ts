/**
 * NodeType.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const isNodeType = function (type) {
  return function (node: Node) {
    return !!node && node.nodeType === type;
  };
};

const isElement = isNodeType(1) as (node: Node) => node is HTMLElement;

const matchNodeNames = function (names: string) {
  const items = names.toLowerCase().split(' ');

  return function (node: Node) {
    let i, name;

    if (node && node.nodeType) {
      name = node.nodeName.toLowerCase();

      for (i = 0; i < items.length; i++) {
        if (name === items[i]) {
          return true;
        }
      }
    }

    return false;
  };
};

const matchStyleValues = function (name: string, values: string) {
  const items = values.toLowerCase().split(' ');

  return function (node) {
    let i, cssValue;

    if (isElement(node)) {
      for (i = 0; i < items.length; i++) {
        const computed = node.ownerDocument.defaultView.getComputedStyle(node, null);
        cssValue = computed ? computed.getPropertyValue(name) : null;
        if (cssValue === items[i]) {
          return true;
        }
      }
    }

    return false;
  };
};

const hasPropValue = function (propName: string, propValue: any) {
  return function (node: Node) {
    return isElement(node) && node[propName] === propValue;
  };
};

const hasAttribute = function (attrName: string, attrValue?: string) {
  return function (node: Node) {
    return isElement(node) && node.hasAttribute(attrName);
  };
};

const hasAttributeValue = function (attrName: string, attrValue: string) {
  return function (node: Node) {
    return isElement(node) && node.getAttribute(attrName) === attrValue;
  };
};

const isBogus = (node: Node): node is Element => isElement(node) && node.hasAttribute('data-mce-bogus');
const isBogusAll = (node: Node): node is Element => isElement(node) && node.getAttribute('data-mce-bogus') === 'all';
const isTable = (node: Node): node is Element => isElement(node) && node.tagName === 'TABLE';

const hasContentEditableState = function (value: string) {
  return function (node: Node) {
    if (isElement(node)) {
      if (node.contentEditable === value) {
        return true;
      }

      if (node.getAttribute('data-mce-contenteditable') === value) {
        return true;
      }
    }

    return false;
  };
};

const isText = isNodeType(3) as (node: Node) => node is Text;
const isComment = isNodeType(8) as (node: Node) => node is Comment;
const isDocument = isNodeType(9) as (node: Node) => node is Document;
const isBr = matchNodeNames('br') as (node: Node) => node is Element;
const isContentEditableTrue = hasContentEditableState('true') as (node: Node) => node is HTMLElement;
const isContentEditableFalse = hasContentEditableState('false') as (node: Node) => node is HTMLElement;

export default {
  isText,
  isElement,
  isComment,
  isDocument,
  isBr,
  isContentEditableTrue,
  isContentEditableFalse,
  matchNodeNames,
  hasPropValue,
  hasAttribute,
  hasAttributeValue,
  matchStyleValues,
  isBogus,
  isBogusAll,
  isTable
};