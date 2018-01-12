/**
 * CaretContainerInline.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import NodeType from '../dom/NodeType';
import Zwsp from '../text/Zwsp';

const isText = NodeType.isText;

const startsWithCaretContainer = function (node) {
  return isText(node) && node.data[0] === Zwsp.ZWSP;
};

const endsWithCaretContainer = function (node) {
  return isText(node) && node.data[node.data.length - 1] === Zwsp.ZWSP;
};

const createZwsp = function (node) {
  return node.ownerDocument.createTextNode(Zwsp.ZWSP);
};

const insertBefore = function (node) {
  if (isText(node.previousSibling)) {
    if (endsWithCaretContainer(node.previousSibling)) {
      return node.previousSibling;
    } else {
      node.previousSibling.appendData(Zwsp.ZWSP);
      return node.previousSibling;
    }
  } else if (isText(node)) {
    if (startsWithCaretContainer(node)) {
      return node;
    } else {
      node.insertData(0, Zwsp.ZWSP);
      return node;
    }
  } else {
    const newNode = createZwsp(node);
    node.parentNode.insertBefore(newNode, node);
    return newNode;
  }
};

const insertAfter = function (node) {
  if (isText(node.nextSibling)) {
    if (startsWithCaretContainer(node.nextSibling)) {
      return node.nextSibling;
    } else {
      node.nextSibling.insertData(0, Zwsp.ZWSP);
      return node.nextSibling;
    }
  } else if (isText(node)) {
    if (endsWithCaretContainer(node)) {
      return node;
    } else {
      node.appendData(Zwsp.ZWSP);
      return node;
    }
  } else {
    const newNode = createZwsp(node);
    if (node.nextSibling) {
      node.parentNode.insertBefore(newNode, node.nextSibling);
    } else {
      node.parentNode.appendChild(newNode);
    }
    return newNode;
  }
};

const insertInline = function (before, node) {
  return before ? insertBefore(node) : insertAfter(node);
};

export default {
  insertInline,
  insertInlineBefore: Fun.curry(insertInline, true),
  insertInlineAfter: Fun.curry(insertInline, false)
};