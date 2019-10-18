/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Text, Comment, Document, Element, Node, HTMLElement, DocumentFragment, HTMLTextAreaElement, HTMLInputElement, HTMLBRElement } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';

const isNodeType = function (type) {
  return function (node: Node) {
    return !!node && node.nodeType === type;
  };
};

// Firefox can allow you to get a selection on a restricted node, such as file/number inputs. These nodes
// won't implement the Object prototype, so Object.getPrototypeOf() will return null or something similar.
const isRestrictedNode = (node: Node): boolean => !!node && !Object.getPrototypeOf(node);

const isElement = isNodeType(1) as (node: Node) => node is HTMLElement;

const matchNodeNames = <T extends Node>(names: string[]) => {
  const lowercasedNames = names.map((s) => s.toLowerCase());

  return (node: Node): node is T => {
    if (node && node.nodeName) {
      const nodeName = node.nodeName.toLowerCase();
      return Arr.contains(lowercasedNames, nodeName);
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

const isTextareaOrInput = matchNodeNames<HTMLTextAreaElement | HTMLInputElement>(['textarea', 'input']);

const isText = isNodeType(3) as (node: Node) => node is Text;
const isComment = isNodeType(8) as (node: Node) => node is Comment;
const isDocument = isNodeType(9) as (node: Node) => node is Document;
const isDocumentFragment = isNodeType(11) as (node: Node) => node is DocumentFragment;
const isBr = matchNodeNames<HTMLBRElement>(['br']);
const isContentEditableTrue = hasContentEditableState('true') as (node: Node) => node is HTMLElement;
const isContentEditableFalse = hasContentEditableState('false') as (node: Node) => node is HTMLElement;

export default {
  isText,
  isElement,
  isComment,
  isDocument,
  isDocumentFragment,
  isBr,
  isContentEditableTrue,
  isContentEditableFalse,
  isRestrictedNode,
  matchNodeNames,
  hasPropValue,
  hasAttribute,
  hasAttributeValue,
  matchStyleValues,
  isBogus,
  isBogusAll,
  isTable,
  isTextareaOrInput
};
