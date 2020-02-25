/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import * as NodeType from '../dom/NodeType';
import * as Zwsp from '../text/Zwsp';
import { Node, Text } from '@ephox/dom-globals';

const isText = NodeType.isText;
const startsWithCaretContainer = (node: Node) => isText(node) && node.data[0] === Zwsp.ZWSP;
const endsWithCaretContainer = (node: Node) => isText(node) && node.data[node.data.length - 1] === Zwsp.ZWSP;
const createZwsp = (node: Node) => node.ownerDocument.createTextNode(Zwsp.ZWSP);

const insertBefore = (node: Node): Text => {
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

const insertAfter = (node: Node) => {
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

const insertInline = (before: boolean, node: Node) => before ? insertBefore(node) : insertAfter(node);
const insertInlineBefore = Fun.curry(insertInline, true) as (node: Node) => Text;
const insertInlineAfter = Fun.curry(insertInline, false) as (node: Node) => Text;

export {
  insertInline,
  insertInlineBefore,
  insertInlineAfter
};
